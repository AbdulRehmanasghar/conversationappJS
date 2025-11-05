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
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_service_1 = require("../twilio/twilio.service");
let ConversationService = class ConversationService {
    constructor(twilioService, configService) {
        this.twilioService = twilioService;
        this.configService = configService;
    }
    setChatGateway(chatGateway) {
        this.chatGateway = chatGateway;
    }
    async generateToken(userId) {
        const AccessToken = require('twilio').jwt.AccessToken;
        const ChatGrant = AccessToken.ChatGrant;
        const identity = `user_${userId}`;
        const token = new AccessToken(this.twilioService.getAccountSid(), this.twilioService.getApiKey(), this.twilioService.getApiSecret(), { ttl: 3600, identity });
        const chatGrant = new ChatGrant({
            serviceSid: this.twilioService.getServiceSid(),
        });
        token.addGrant(chatGrant);
        return token.toJwt();
    }
    async createConversation(friendlyName, participants) {
        try {
            let conversationName = friendlyName;
            if (!conversationName && participants && participants.length > 0) {
                if (typeof participants[0] === 'object' && participants[0].id) {
                    conversationName = participants
                        .map(p => `${p.id}_${p.name}_${p.image || ''}`)
                        .join('+');
                }
                else {
                    conversationName = participants.join('_');
                }
            }
            const conversation = await this.twilioService
                .getClient()
                .conversations.v1.conversations.create({
                friendlyName: conversationName,
            });
            if (participants && participants.length > 0) {
                for (const participant of participants) {
                    const participantId = typeof participant === 'object' ? participant.id : participant;
                    await this.addChatParticipant(conversation.sid, participantId);
                }
            }
            return {
                success: true,
                conversation_sid: conversation.sid,
                friendly_name: conversation.friendlyName,
                participants: participants || [],
            };
        }
        catch (error) {
            throw new Error(`Failed to create conversation: ${error.message}`);
        }
    }
    async createPrivateConversation(user1, user2) {
        const uniqueName = [user1, user2].sort().join('_');
        try {
            const conversations = await this.twilioService
                .getClient()
                .conversations.v1.conversations.list({ limit: 1000 });
            const existingConvo = conversations.find(c => c.uniqueName === uniqueName);
            if (existingConvo) {
                return {
                    success: true,
                    conversation_sid: existingConvo.sid,
                    friendly_name: existingConvo.friendlyName,
                    participants: [user1, user2],
                    existing: true,
                };
            }
            const conversation = await this.twilioService
                .getClient()
                .conversations.v1.conversations.create({
                friendlyName: `Private: ${user1} & ${user2}`,
                uniqueName,
            });
            await this.addChatParticipant(conversation.sid, user1);
            await this.addChatParticipant(conversation.sid, user2);
            return {
                success: true,
                conversation_sid: conversation.sid,
                friendly_name: conversation.friendlyName,
                participants: [user1, user2],
                existing: false,
            };
        }
        catch (error) {
            throw new Error(`Failed to create private conversation: ${error.message}`);
        }
    }
    async addChatParticipant(conversationSid, identity) {
        try {
            const participant = await this.twilioService
                .getClient()
                .conversations.v1.conversations(conversationSid)
                .participants.create({ identity });
            return {
                success: true,
                participant_sid: participant.sid,
                identity: participant.identity,
            };
        }
        catch (error) {
            throw new Error(`Failed to add chat participant: ${error.message}`);
        }
    }
    async addSmsParticipant(conversationSid, phoneNumber) {
        try {
            const participant = await this.twilioService
                .getClient()
                .conversations.v1.conversations(conversationSid)
                .participants.create({
                'messagingBinding.address': phoneNumber,
                'messagingBinding.proxyAddress': this.configService.get('TWILIO_PHONE_NUMBER')
            });
            return {
                success: true,
                participant_sid: participant.sid,
                phone_number: phoneNumber,
            };
        }
        catch (error) {
            throw new Error(`Failed to add SMS participant: ${error.message}`);
        }
    }
    async sendMessage(conversationSid, body, author, media) {
        try {
            const messageData = { body, author };
            if (media && media.length > 0) {
                messageData.media = media;
            }
            const message = await this.twilioService
                .getClient()
                .conversations.v1.conversations(conversationSid)
                .messages.create(messageData);
            const result = {
                success: true,
                message_sid: message.sid,
                body: message.body,
                author: message.author,
                date_created: message.dateCreated,
            };
            if (this.chatGateway) {
                this.chatGateway.broadcastMessage(conversationSid, {
                    sid: message.sid,
                    body: message.body,
                    author: message.author,
                    dateCreated: message.dateCreated,
                    media: media || [],
                });
            }
            return result;
        }
        catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }
    async listConversations(userId) {
        try {
            const client = this.twilioService.getClient();
            const conversations = await client.conversations.v1.conversations.list({ limit: 1000 });
            const convoPromises = conversations.map(async (conversation) => {
                const convoSid = conversation.sid;
                const messagesP = client.conversations.v1.conversations(convoSid).messages.list({ limit: 1 });
                const participantsP = userId ? client.conversations.v1.conversations(convoSid).participants.list() : Promise.resolve([]);
                const [messagesRes, participantsRes] = await Promise.allSettled([messagesP, participantsP]);
                const last = messagesRes.status === 'fulfilled' && messagesRes.value && messagesRes.value.length > 0 ? messagesRes.value[0] : null;
                const participants = participantsRes.status === 'fulfilled' ? participantsRes.value : [];
                const hasUser = userId ? participants.some((p) => p.identity === userId) : true;
                if (!hasUser)
                    return null;
                return {
                    sid: convoSid,
                    friendly_name: conversation.friendlyName,
                    date_created: conversation.dateCreated,
                    date_updated: conversation.dateUpdated,
                    last_message: last
                        ? {
                            sid: last.sid,
                            body: last.body,
                            author: last.author,
                            date_created: last.dateCreated,
                            media: last.media || [],
                        }
                        : null,
                };
            });
            const settled = await Promise.allSettled(convoPromises);
            const result = settled
                .filter((s) => s.status === 'fulfilled')
                .map((s) => s.value)
                .filter(Boolean);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to list conversations: ${error.message}`);
        }
    }
    async getMessages(conversationSid) {
        try {
            const messages = await this.twilioService
                .getClient()
                .conversations.v1.conversations(conversationSid)
                .messages.list({ limit: 100 });
            return messages.map(message => ({
                sid: message.sid,
                body: message.body,
                author: message.author,
                date_created: message.dateCreated,
                media: message.media,
            }));
        }
        catch (error) {
            throw new Error(`Failed to get messages: ${error.message}`);
        }
    }
    async getMediaContent(mediaSid) {
        try {
            return {
                content_type: 'application/octet-stream',
                size: 0,
                url: `https://media.twiliocdn.com/${mediaSid}`,
            };
        }
        catch (error) {
            throw new Error(`Failed to get media content: ${error.message}`);
        }
    }
    async deleteConversation(conversationSid) {
        try {
            await this.twilioService
                .getClient()
                .conversations.v1.conversations(conversationSid)
                .remove();
            return { success: true, message: 'Conversation deleted successfully' };
        }
        catch (error) {
            throw new Error(`Failed to delete conversation: ${error.message}`);
        }
    }
    async enableReachability() {
        try {
            return { success: true, message: 'Reachability feature configured' };
        }
        catch (error) {
            throw new Error(`Failed to enable reachability: ${error.message}`);
        }
    }
    async getUserReachability(identity) {
        try {
            return {
                identity,
                online: false,
                not_reachable: true,
            };
        }
        catch (error) {
            throw new Error(`Failed to get user reachability: ${error.message}`);
        }
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService,
        config_1.ConfigService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map