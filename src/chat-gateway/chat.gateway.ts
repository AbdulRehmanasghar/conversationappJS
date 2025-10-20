import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConversationService } from '../conversation/conversation.service';

interface ConnectedUser {
  userId: string;
  identity: string;
  socketId: string;
  conversationSids: string[];
  lastSeen: Date;
}

interface TypingData {
  conversationSid: string;
  identity: string;
  isTyping: boolean;
}

interface JoinConversationData {
  conversationSid: string;
  identity: string;
}

interface SendMessageData {
  conversationSid: string;
  body: string;
  author: string;
  media?: string[];
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private conversationUsers: Map<string, Set<string>> = new Map(); // conversationSid -> Set of userIds

  constructor(private conversationService: ConversationService) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 Client disconnected: ${client.id}`);
    
    // Find and remove the user from connected users
    for (const [userId, userData] of this.connectedUsers.entries()) {
      if (userData.socketId === client.id) {
        // Remove user from all conversations
        userData.conversationSids.forEach(conversationSid => {
          const conversationUsers = this.conversationUsers.get(conversationSid);
          if (conversationUsers) {
            conversationUsers.delete(userId);
            if (conversationUsers.size === 0) {
              this.conversationUsers.delete(conversationSid);
            }
          }
          
          // Notify other users in the conversation
          client.to(conversationSid).emit('user_left', {
            conversationSid,
            identity: userData.identity,
            timestamp: new Date(),
          });
        });
        
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('user_connect')
  handleUserConnect(
    @MessageBody() data: { userId: string; identity: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const { userId, identity } = data;
    
    this.logger.log(`👤 User connecting: ${identity} (${userId})`);
    
    const userData: ConnectedUser = {
      userId,
      identity,
      socketId: client.id,
      conversationSids: [],
      lastSeen: new Date(),
    };
    
    this.connectedUsers.set(userId, userData);
    
    client.emit('user_connected', {
      success: true,
      message: 'Connected to chat server',
      userId,
      identity,
    });
    
    this.logger.log(`✅ User connected: ${identity}`);
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @MessageBody() data: JoinConversationData,
    @ConnectedSocket() client: Socket,
  ): void {
    const { conversationSid, identity } = data;
    
    this.logger.log(`🏠 User ${identity} joining conversation: ${conversationSid}`);
    
    // Join the socket room
    client.join(conversationSid);
    
    // Update user's conversation list
    const user = this.findUserBySocketId(client.id);
    if (user) {
      if (!user.conversationSids.includes(conversationSid)) {
        user.conversationSids.push(conversationSid);
      }
      
      // Add user to conversation users map
      if (!this.conversationUsers.has(conversationSid)) {
        this.conversationUsers.set(conversationSid, new Set());
      }
      this.conversationUsers.get(conversationSid)!.add(user.userId);
      
      // Notify other users in the conversation
      client.to(conversationSid).emit('user_joined', {
        conversationSid,
        identity,
        timestamp: new Date(),
      });
      
      // Send current online users in this conversation
      const onlineUsers = this.getOnlineUsersInConversation(conversationSid);
      client.emit('conversation_users', {
        conversationSid,
        onlineUsers,
      });
    }
    
    client.emit('joined_conversation', {
      success: true,
      conversationSid,
      message: `Joined conversation ${conversationSid}`,
    });
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @MessageBody() data: JoinConversationData,
    @ConnectedSocket() client: Socket,
  ): void {
    const { conversationSid, identity } = data;
    
    this.logger.log(`🚪 User ${identity} leaving conversation: ${conversationSid}`);
    
    client.leave(conversationSid);
    
    const user = this.findUserBySocketId(client.id);
    if (user) {
      user.conversationSids = user.conversationSids.filter(sid => sid !== conversationSid);
      
      const conversationUsers = this.conversationUsers.get(conversationSid);
      if (conversationUsers) {
        conversationUsers.delete(user.userId);
      }
      
      // Notify other users
      client.to(conversationSid).emit('user_left', {
        conversationSid,
        identity,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: SendMessageData,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { conversationSid, body, author, media } = data;
    
    this.logger.log(`💬 Message from ${author} in ${conversationSid}: ${body.substring(0, 50)}...`);
    
    try {
      // Send message via Twilio
      const result = await this.conversationService.sendMessage(
        conversationSid,
        body,
        author,
        media,
      );
      
      if (result.success) {
        // Broadcast message to all users in the conversation (including sender for confirmation)
        this.server.to(conversationSid).emit('new_message', {
          conversationSid,
          message: {
            sid: result.message_sid,
            body: result.body,
            author: result.author,
            dateCreated: result.date_created,
            media: media || [],
          },
          timestamp: new Date(),
        });
        
        // Send confirmation to sender
        client.emit('message_sent', {
          success: true,
          messageSid: result.message_sid,
          conversationSid,
        });
      } else {
        client.emit('message_error', {
          success: false,
          error: 'Failed to send message',
          conversationSid,
        });
      }
    } catch (error) {
      this.logger.error(`❌ Error sending message: ${error.message}`);
      client.emit('message_error', {
        success: false,
        error: error.message,
        conversationSid,
      });
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: TypingData,
    @ConnectedSocket() client: Socket,
  ): void {
    const { conversationSid, identity } = data;
    
    // Broadcast typing indicator to other users in the conversation
    client.to(conversationSid).emit('user_typing', {
      conversationSid,
      identity,
      isTyping: true,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: TypingData,
    @ConnectedSocket() client: Socket,
  ): void {
    const { conversationSid, identity } = data;
    
    // Broadcast stop typing to other users in the conversation
    client.to(conversationSid).emit('user_typing', {
      conversationSid,
      identity,
      isTyping: false,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('get_online_users')
  handleGetOnlineUsers(
    @MessageBody() data: { conversationSid: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const { conversationSid } = data;
    const onlineUsers = this.getOnlineUsersInConversation(conversationSid);
    
    client.emit('online_users', {
      conversationSid,
      users: onlineUsers,
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    const user = this.findUserBySocketId(client.id);
    if (user) {
      user.lastSeen = new Date();
    }
    client.emit('pong', { timestamp: new Date() });
  }

  // Helper methods
  private findUserBySocketId(socketId: string): ConnectedUser | undefined {
    for (const user of this.connectedUsers.values()) {
      if (user.socketId === socketId) {
        return user;
      }
    }
    return undefined;
  }

  private getOnlineUsersInConversation(conversationSid: string): any[] {
    const conversationUsers = this.conversationUsers.get(conversationSid);
    if (!conversationUsers) return [];
    
    const onlineUsers = [];
    for (const userId of conversationUsers) {
      const user = this.connectedUsers.get(userId);
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

  // Public methods for external use (called from HTTP endpoints)
  public broadcastNewMessage(conversationSid: string, message: any): void {
    this.server.to(conversationSid).emit('new_message', {
      conversationSid,
      message,
      timestamp: new Date(),
    });
  }

  public broadcastConversationUpdate(conversationSid: string, update: any): void {
    this.server.to(conversationSid).emit('conversation_updated', {
      conversationSid,
      update,
      timestamp: new Date(),
    });
  }

  public broadcastUserStatus(userId: string, status: any): void {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.conversationSids.forEach(conversationSid => {
        this.server.to(conversationSid).emit('user_status_changed', {
          conversationSid,
          userId,
          identity: user.identity,
          status,
          timestamp: new Date(),
        });
      });
    }
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getUsersInConversation(conversationSid: string): string[] {
    const users = this.conversationUsers.get(conversationSid);
    return users ? Array.from(users) : [];
  }
}