"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const conversation_service_1 = require("../conversation/conversation.service");
let ChatGateway = class ChatGateway {
    constructor(conversationService) {
        this.conversationService = conversationService;
        this.users = new Map();
        this.conversations = new Map();
    }
    afterInit(server) {
        console.log('✅ Simple Chat Gateway initialized');
        this.setupSocketEvents();
    }
    handleConnection(client) {
        console.log(`🔌 New connection: ${client.id}`);
    }
    handleDisconnect(client) {
        this.onDisconnect(client);
    }
    setupSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);
            socket.on('user_connect', (data) => {
                console.log('📨 Received user_connect:', data);
                this.onUserConnect(socket, data);
            });
            socket.on('join_conversation', (data) => {
                console.log('📨 Received join_conversation:', data);
                this.onJoinConversation(socket, data);
            });
            socket.on('leave_conversation', (data) => {
                console.log('📨 Received leave_conversation:', data);
                this.onLeaveConversation(socket, data);
            });
            socket.on('send_message', (data) => {
                console.log('📨 Received send_message:', data);
                this.onSendMessage(socket, data);
            });
            socket.on('typing_start', (data) => {
                this.onTypingStart(socket, data);
            });
            socket.on('typing_stop', (data) => {
                this.onTypingStop(socket, data);
            });
            socket.on('get_online_users', (data) => {
                this.onGetOnlineUsers(socket, data);
            });
            socket.on('ping', () => {
                this.onPing(socket);
            });
            socket.on('disconnect', () => {
                this.onDisconnect(socket);
            });
        });
    }
    onUserConnect(socket, data) {
        const { userId, identity } = data;
        console.log(`👤 User connecting: ${identity} (${userId})`);
        const user = {
            userId,
            identity,
            socketId: socket.id,
            conversationSids: [],
            lastSeen: new Date(),
        };
        this.users.set(userId, user);
        socket.emit('user_connected', {
            success: true,
            message: 'Connected to chat server',
            userId,
            identity,
        });
        console.log(`✅ User connected: ${identity}`);
    }
    onJoinConversation(socket, data) {
        const { conversationSid, identity } = data;
        console.log(`🏠 ${identity} joining conversation: ${conversationSid}`);
        socket.join(conversationSid);
        const user = this.findUserBySocketId(socket.id);
        if (user) {
            if (!user.conversationSids.includes(conversationSid)) {
                user.conversationSids.push(conversationSid);
            }
            if (!this.conversations.has(conversationSid)) {
                this.conversations.set(conversationSid, new Set());
            }
            this.conversations.get(conversationSid).add(user.userId);
            socket.to(conversationSid).emit('user_joined', {
                conversationSid,
                identity,
                timestamp: new Date(),
            });
            const onlineUsers = this.getOnlineUsers(conversationSid);
            socket.emit('conversation_users', {
                conversationSid,
                onlineUsers,
            });
        }
        socket.emit('joined_conversation', {
            success: true,
            conversationSid,
            message: `Joined conversation ${conversationSid}`,
        });
    }
    onLeaveConversation(socket, data) {
        const { conversationSid, identity } = data;
        console.log(`🚪 ${identity} leaving conversation: ${conversationSid}`);
        socket.leave(conversationSid);
        const user = this.findUserBySocketId(socket.id);
        if (user) {
            user.conversationSids = user.conversationSids.filter(sid => sid !== conversationSid);
            const conversationUsers = this.conversations.get(conversationSid);
            if (conversationUsers) {
                conversationUsers.delete(user.userId);
            }
            socket.to(conversationSid).emit('user_left', {
                conversationSid,
                identity,
                timestamp: new Date(),
            });
        }
    }
    async onSendMessage(socket, data) {
        const { conversationSid, body, author, media } = data;
        console.log(`💬 Message from ${author}: ${body.substring(0, 50)}...`);
        try {
            const twilioResult = await this.conversationService.sendMessage(conversationSid, body, author, media);
            const message = {
                sid: twilioResult.message_sid,
                body: twilioResult.body,
                author: twilioResult.author,
                dateCreated: twilioResult.date_created,
                media: media || [],
            };
            this.io.to(conversationSid).emit('new_message', {
                conversationSid,
                message,
                timestamp: new Date(),
            });
            socket.emit('message_sent', {
                success: true,
                messageSid: message.sid,
                conversationSid,
            });
        }
        catch (error) {
            console.error(`❌ Error: ${error.message}`);
            socket.emit('message_error', {
                success: false,
                error: error.message,
                conversationSid,
            });
        }
    }
    onTypingStart(socket, data) {
        const { conversationSid, identity } = data;
        socket.to(conversationSid).emit('user_typing', {
            conversationSid,
            identity,
            isTyping: true,
            timestamp: new Date(),
        });
    }
    onTypingStop(socket, data) {
        const { conversationSid, identity } = data;
        socket.to(conversationSid).emit('user_typing', {
            conversationSid,
            identity,
            isTyping: false,
            timestamp: new Date(),
        });
    }
    onGetOnlineUsers(socket, data) {
        const { conversationSid } = data;
        const onlineUsers = this.getOnlineUsers(conversationSid);
        socket.emit('online_users', {
            conversationSid,
            users: onlineUsers,
        });
    }
    onPing(socket) {
        const user = this.findUserBySocketId(socket.id);
        if (user) {
            user.lastSeen = new Date();
        }
        socket.emit('pong', { timestamp: new Date() });
    }
    onDisconnect(socket) {
        console.log(`🔌 Disconnected: ${socket.id}`);
        for (const [userId, user] of this.users.entries()) {
            if (user.socketId === socket.id) {
                user.conversationSids.forEach(conversationSid => {
                    const conversationUsers = this.conversations.get(conversationSid);
                    if (conversationUsers) {
                        conversationUsers.delete(userId);
                        if (conversationUsers.size === 0) {
                            this.conversations.delete(conversationSid);
                        }
                    }
                    socket.to(conversationSid).emit('user_left', {
                        conversationSid,
                        identity: user.identity,
                        timestamp: new Date(),
                    });
                });
                this.users.delete(userId);
                break;
            }
        }
    }
    findUserBySocketId(socketId) {
        for (const user of this.users.values()) {
            if (user.socketId === socketId) {
                return user;
            }
        }
        return undefined;
    }
    getOnlineUsers(conversationSid) {
        const conversationUsers = this.conversations.get(conversationSid);
        if (!conversationUsers)
            return [];
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
    broadcastMessage(conversationSid, message) {
        this.io.to(conversationSid).emit('new_message', {
            conversationSid,
            message,
            timestamp: new Date(),
        });
    }
    broadcastUpdate(conversationSid, update) {
        this.io.to(conversationSid).emit('conversation_updated', {
            conversationSid,
            update,
            timestamp: new Date(),
        });
    }
    broadcastUserStatus(userId, status) {
        const user = this.users.get(userId);
        if (user) {
            user.conversationSids.forEach(conversationSid => {
                this.io.to(conversationSid).emit('user_status_changed', {
                    conversationSid,
                    userId,
                    identity: user.identity,
                    status,
                    timestamp: new Date(),
                });
            });
        }
    }
    getConnectedUsersCount() {
        return this.users.size;
    }
    getUsersInConversation(conversationSid) {
        const users = this.conversations.get(conversationSid);
        return users ? Array.from(users) : [];
    }
    getSocketServer() {
        return this.io;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "io", void 0);
exports.ChatGateway = ChatGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map