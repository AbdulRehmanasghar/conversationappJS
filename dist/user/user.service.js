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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const twilio_service_1 = require("../twilio/twilio.service");
let UserService = class UserService {
    constructor(prismaService, twilioService) {
        this.prismaService = prismaService;
        this.twilioService = twilioService;
    }
    async createTwilioUser(createTwilioUserDto) {
        try {
            const twilioUser = await this.twilioService
                .getClient()
                .conversations.v1.services(this.twilioService.getServiceSid())
                .users.create({
                identity: createTwilioUserDto.identity,
                friendlyName: createTwilioUserDto.friendly_name || createTwilioUserDto.identity,
            });
            const savedUser = await this.prismaService.twilioUser.create({
                data: {
                    identity: createTwilioUserDto.identity,
                    friendlyName: createTwilioUserDto.friendly_name,
                    email: createTwilioUserDto.email,
                    phoneNumber: createTwilioUserDto.phone_number,
                },
            });
            return {
                success: true,
                twilio_user: {
                    sid: twilioUser.sid,
                    identity: twilioUser.identity,
                    friendly_name: twilioUser.friendlyName,
                },
                database_user: savedUser,
            };
        }
        catch (error) {
            throw new Error(`Failed to create Twilio user: ${error.message}`);
        }
    }
    async getAllTwilioUsers() {
        try {
            const users = await this.prismaService.twilioUser.findMany();
            return users;
        }
        catch (error) {
            throw new Error(`Failed to get Twilio users: ${error.message}`);
        }
    }
    async deleteTwilioUser(id) {
        try {
            const user = await this.prismaService.twilioUser.findUnique({
                where: { id }
            });
            if (!user) {
                throw new Error('User not found');
            }
            try {
                await this.twilioService
                    .getClient()
                    .conversations.v1.services(this.twilioService.getServiceSid())
                    .users(user.identity)
                    .remove();
            }
            catch (twilioError) {
                console.warn(`Failed to delete user from Twilio: ${twilioError.message}`);
            }
            await this.prismaService.twilioUser.delete({
                where: { id },
            });
            return {
                success: true,
                message: 'User deleted successfully',
            };
        }
        catch (error) {
            throw new Error(`Failed to delete Twilio user: ${error.message}`);
        }
    }
    async saveFcmToken(userId, fcmToken, deviceType) {
        try {
            const existingToken = await this.prismaService.userFcmToken.findFirst({
                where: {
                    userId: userId,
                    fcmToken: fcmToken
                },
            });
            if (existingToken) {
                const updatedToken = await this.prismaService.userFcmToken.update({
                    where: { id: existingToken.id },
                    data: { deviceType },
                });
                return {
                    success: true,
                    message: 'FCM token updated successfully',
                    data: updatedToken,
                };
            }
            const savedToken = await this.prismaService.userFcmToken.create({
                data: {
                    userId,
                    fcmToken,
                    deviceType,
                },
            });
            return {
                success: true,
                message: 'FCM token saved successfully',
                data: savedToken,
            };
        }
        catch (error) {
            throw new Error(`Failed to save FCM token: ${error.message}`);
        }
    }
    async getFcmTokensByUserId(userId) {
        try {
            const tokens = await this.prismaService.userFcmToken.findMany({
                where: { userId },
            });
            return tokens.map(token => token.fcmToken);
        }
        catch (error) {
            throw new Error(`Failed to get FCM tokens: ${error.message}`);
        }
    }
    async syncGroupsToConversations(groups) {
        const results = [];
        for (const group of groups) {
            try {
                const conversation = await this.twilioService
                    .getClient()
                    .conversations.v1.conversations.create({
                    friendlyName: group.group_name,
                    uniqueName: `group_${group.group_id}`,
                });
                results.push({
                    group_id: group.group_id,
                    conversation_sid: conversation.sid,
                    success: true,
                });
            }
            catch (error) {
                results.push({
                    group_id: group.group_id,
                    success: false,
                    error: error.message,
                });
            }
        }
        return {
            success: true,
            message: 'Groups synchronized to conversations',
            results,
        };
    }
    async addParticipantsToGroup(groupId, participants) {
        try {
            const conversationUniqueName = `group_${groupId}`;
            const conversations = await this.twilioService
                .getClient()
                .conversations.v1.conversations.list();
            const conversation = conversations.find(c => c.uniqueName === conversationUniqueName);
            if (!conversation) {
                throw new Error('Group conversation not found');
            }
            const results = [];
            for (const participant of participants) {
                try {
                    await this.twilioService
                        .getClient()
                        .conversations.v1.conversations(conversation.sid)
                        .participants.create({ identity: participant });
                    results.push({
                        participant,
                        success: true,
                    });
                }
                catch (error) {
                    results.push({
                        participant,
                        success: false,
                        error: error.message,
                    });
                }
            }
            return {
                success: true,
                message: 'Participants added to group',
                group_id: groupId,
                conversation_sid: conversation.sid,
                results,
            };
        }
        catch (error) {
            throw new Error(`Failed to add participants to group: ${error.message}`);
        }
    }
    async deleteAllGroups() {
        try {
            const conversations = await this.twilioService
                .getClient()
                .conversations.v1.conversations.list();
            const groupConversations = conversations.filter(c => c.uniqueName && c.uniqueName.startsWith('group_'));
            const results = [];
            for (const conversation of groupConversations) {
                try {
                    await this.twilioService
                        .getClient()
                        .conversations.v1.conversations(conversation.sid)
                        .remove();
                    results.push({
                        conversation_sid: conversation.sid,
                        unique_name: conversation.uniqueName,
                        success: true,
                    });
                }
                catch (error) {
                    results.push({
                        conversation_sid: conversation.sid,
                        unique_name: conversation.uniqueName,
                        success: false,
                        error: error.message,
                    });
                }
            }
            return {
                success: true,
                message: 'All group conversations deleted',
                deleted_count: results.filter(r => r.success).length,
                results,
            };
        }
        catch (error) {
            throw new Error(`Failed to delete all groups: ${error.message}`);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        twilio_service_1.TwilioService])
], UserService);
//# sourceMappingURL=user.service.js.map