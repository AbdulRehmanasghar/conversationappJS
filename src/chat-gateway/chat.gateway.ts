import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { ConversationService } from "../conversation/conversation.service";

// Simple interfaces - no complex types
interface User {
  userId: string;
  identity: string;
  socketId: string;
  conversationSids: string[];
  lastSeen: Date;
}

// Simple Chat Gateway - Minimal NestJS integration but easy to understand
@Injectable()
@WebSocketGateway({
  cors: { origin: "*" },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private io: Server;

  private users: Map<string, User> = new Map();
  private conversations: Map<string, Set<string>> = new Map();

  constructor(private conversationService: ConversationService) {}

  // When WebSocket server initializes
  afterInit(server: Server) {
    console.log("✅ Simple Chat Gateway initialized");
    this.setupSocketEvents();
  }

  // When client connects
  handleConnection(client: Socket) {
    console.log(`🔌 New connection: ${client.id}`);
  }

  // When client disconnects
  handleDisconnect(client: Socket) {
    this.onDisconnect(client);
  }

  // Setup all socket event listeners
  private setupSocketEvents(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Listen for user connecting
      socket.on("user_connect", (data: any) => {
        console.log("📨 Received user_connect:", data);
        // this.onUserConnect(socket, data);
        this.io.emit("user_connected", {
          success: true,
          message: "Connected to chat server (mock)",
        });
      });

      // Listen for joining conversation
      socket.on("join_conversation", (data: any) => {
        console.log("📨 Received join_conversation:", data);
        this.onJoinConversation(socket, data);
      });

      // Listen for leaving conversation
      socket.on("leave_conversation", (data: any) => {
        console.log("📨 Received leave_conversation:", data);
        this.onLeaveConversation(socket, data);
      });

      // Listen for sending message
      socket.on("send_message", (data: any) => {
        console.log("📨 Received send_message:", data);
        this.onSendMessage(socket, data);
      });

      // Listen for typing events
      socket.on("typing_start", (data: any) => {
        this.onTypingStart(socket, data);
      });

      socket.on("typing_stop", (data: any) => {
        this.onTypingStop(socket, data);
      });

      // Listen for getting online users
      socket.on("get_online_users", (data: any) => {
        this.onGetOnlineUsers(socket, data);
      });

      // Listen for ping
      socket.on("ping", () => {
        console.log("📨 Received ping");
        this.onPing(socket);
      });

      // Listen for disconnect
      socket.on("disconnect", () => {
        this.onDisconnect(socket);
      });
    });
  }

  // When user connects and sends their info
  private onUserConnect(socket: Socket, data: any): void {
    const { userId, identity } = data;

    console.log(`👤 User connecting: ${identity} (${userId})`);

    // Create user data
    const user: User = {
      userId,
      identity,
      socketId: socket.id,
      conversationSids: [],
      lastSeen: new Date(),
    };

    // Store user
    this.users.set(userId, user);

    // Send confirmation back to user
    socket.emit("user_connected", {
      success: true,
      message: "Connected to chat server",
      userId,
      identity,
    });

    console.log(`✅ User connected: ${identity}`);
  }

  // When user wants to join a conversation room
  private onJoinConversation(socket: Socket, data: any): void {
    const { conversationSid, identity } = data;

    console.log(`🏠 ${identity} joining conversation: ${conversationSid}`);

    // Join the socket room (this is how Socket.IO groups connections)
    socket.join(conversationSid);

    // Find user and update their data
    const user = this.findUserBySocketId(socket.id);
    if (user) {
      // Add conversation to user's list
      if (!user.conversationSids.includes(conversationSid)) {
        user.conversationSids.push(conversationSid);
      }

      // Add user to conversation tracking
      if (!this.conversations.has(conversationSid)) {
        this.conversations.set(conversationSid, new Set());
      }
      this.conversations.get(conversationSid)!.add(user.userId);

      // Tell everyone else in the room that this user joined
      socket.to(conversationSid).emit("user_joined", {
        conversationSid,
        identity,
        timestamp: new Date(),
      });

      // Send list of online users to the new user
      const onlineUsers = this.getOnlineUsers(conversationSid);
      socket.emit("conversation_users", {
        conversationSid,
        onlineUsers,
      });
    }

    // Confirm to user they joined
    socket.emit("joined_conversation", {
      success: true,
      conversationSid,
      message: `Joined conversation ${conversationSid}`,
    });
  }

  // When user wants to leave a conversation
  private onLeaveConversation(socket: Socket, data: any): void {
    const { conversationSid, identity } = data;

    console.log(`🚪 ${identity} leaving conversation: ${conversationSid}`);

    // Leave the socket room
    socket.leave(conversationSid);

    // Update user data
    const user = this.findUserBySocketId(socket.id);
    if (user) {
      // Remove conversation from user's list
      user.conversationSids = user.conversationSids.filter(
        (sid) => sid !== conversationSid
      );

      // Remove user from conversation tracking
      const conversationUsers = this.conversations.get(conversationSid);
      if (conversationUsers) {
        conversationUsers.delete(user.userId);
      }

      // Tell others user left
      socket.to(conversationSid).emit("user_left", {
        conversationSid,
        identity,
        timestamp: new Date(),
      });
    }
  }

  // When user sends a message
  private async onSendMessage(socket: Socket, data: any): Promise<void> {
    const { conversationSid, body, author, media } = data;

    const preview =
      body && typeof body === "string" ? body.substring(0, 50) : "<no body>";
    console.log(`💬 Message from ${author}: ${preview}...`);

    try {
      // Send via Twilio API (this will be the real message)
      const twilioResult = await this.conversationService.sendMessage(
        conversationSid,
        body,
        author,
        media
      );

      // Create message object for Socket.IO broadcast
      const message = {
        sid: twilioResult.message_sid,
        body: twilioResult.body,
        author: twilioResult.author,
        dateCreated: twilioResult.date_created,
        media: media || [],
      };

      // Send message to everyone in the conversation room (including sender)
      this.io.to(conversationSid).emit("new_message", {
        conversationSid,
        message,
        timestamp: new Date(),
      });

      // Confirm to sender
      socket.emit("message_sent", {
        success: true,
        messageSid: message.sid,
        conversationSid,
      });
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
      socket.emit("message_error", {
        success: false,
        error: error.message,
        conversationSid,
      });
    }
  }

  // When user starts typing
  private onTypingStart(socket: Socket, data: any): void {
    const { conversationSid, identity } = data;

    // Tell others in room that user is typing
    socket.to(conversationSid).emit("user_typing", {
      conversationSid,
      identity,
      isTyping: true,
      timestamp: new Date(),
    });
  }

  // When user stops typing
  private onTypingStop(socket: Socket, data: any): void {
    const { conversationSid, identity } = data;

    // Tell others user stopped typing
    socket.to(conversationSid).emit("user_typing", {
      conversationSid,
      identity,
      isTyping: false,
      timestamp: new Date(),
    });
  }

  // When user wants to see who's online
  private onGetOnlineUsers(socket: Socket, data: any): void {
    const { conversationSid } = data;
    const onlineUsers = this.getOnlineUsers(conversationSid);

    socket.emit("online_users", {
      conversationSid,
      users: onlineUsers,
    });
  }

  // Health check ping
  private onPing(socket: Socket): void {
    const user = this.findUserBySocketId(socket.id);
    if (user) {
      user.lastSeen = new Date();
    }
    socket.emit("pong", { timestamp: new Date() });
  }

  // When user disconnects
  private onDisconnect(socket: Socket): void {
    console.log(`🔌 Disconnected: ${socket.id}`);

    // Find user and clean up
    for (const [userId, user] of this.users.entries()) {
      if (user.socketId === socket.id) {
        // Remove from all conversations
        user.conversationSids.forEach((conversationSid) => {
          const conversationUsers = this.conversations.get(conversationSid);
          if (conversationUsers) {
            conversationUsers.delete(userId);
            if (conversationUsers.size === 0) {
              this.conversations.delete(conversationSid);
            }
          }

          // Tell others user left
          socket.to(conversationSid).emit("user_left", {
            conversationSid,
            identity: user.identity,
            timestamp: new Date(),
          });
        });

        // Remove user completely
        this.users.delete(userId);
        break;
      }
    }
  }

  // Find user by their socket ID
  private findUserBySocketId(socketId: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.socketId === socketId) {
        return user;
      }
    }
    return undefined;
  }

  // Get list of online users in a conversation
  private getOnlineUsers(conversationSid: string): any[] {
    const conversationUsers = this.conversations.get(conversationSid);
    if (!conversationUsers) return [];

    const onlineUsers = [];
    for (const userId of conversationUsers) {
      const user = this.users.get(userId);
      if (user) {
        onlineUsers.push({
          userId: user.userId,
          identity: user.identity,
          lastSeen: user.lastSeen,
        });
      }
    }

    return onlineUsers;
  }

  // Public methods you can call from outside

  // Broadcast a message to everyone connected to socket
  public broadcastMessage(conversationSid: string, message: any): void {
    const dateCreated =
      message && message.dateCreated
        ? new Date(message.dateCreated).toISOString()
        : null;
    const dateUpdated =
      message && message.dateUpdated
        ? new Date(message.dateUpdated).toISOString()
        : null;

    const payload = {
      status: 200,
      message: "",
      data: {
        success: true,
        conversationSid: conversationSid,
        friendlyName: message && message.friendlyName ? message.friendlyName : "",
        sid: message && message.sid ? message.sid : null,
        body: message && message.body ? message.body : null,
        author: message && message.author ? message.author : null,
        datecreated: dateCreated,
        dateupdated: dateUpdated,
        media_urls: message && message.media ? message.media : [],
      },
    };

    this.io.emit("new_message", payload);
    console.log("Broadcasted message to all clients for conversation", conversationSid);
  }

  // Broadcast any update to everyone connected to socket
  public broadcastUpdate(conversationSid: string, update: any): void {
    this.io.emit("conversation_updated", {
      conversationSid,
      update,
      timestamp: new Date(),
    });
  }

  // Broadcast user status change to everyone connected to socket
  public broadcastUserStatus(userId: string, status: any): void {
    const user = this.users.get(userId);
    if (user) {
      this.io.emit("user_status_changed", {
        userId,
        identity: user.identity,
        status,
        timestamp: new Date(),
      });
    }
  }

  // Get total connected users count
  public getConnectedUsersCount(): number {
    return this.users.size;
  }

  // Get users in a specific conversation
  public getUsersInConversation(conversationSid: string): string[] {
    const users = this.conversations.get(conversationSid);
    return users ? Array.from(users) : [];
  }

  // Get the Socket.IO server instance
  public getSocketServer(): Server {
    return this.io;
  }
}
