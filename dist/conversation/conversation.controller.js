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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const common_1 = require("@nestjs/common");
const conversation_service_1 = require("./conversation.service");
const generate_token_dto_1 = require("./dto/generate-token.dto");
const conversation_dto_1 = require("./dto/conversation.dto");
let ConversationController = class ConversationController {
    constructor(conversationService) {
        this.conversationService = conversationService;
    }
    async generateToken(generateTokenDto) {
        try {
            const token = await this.conversationService.generateToken(generateTokenDto.user_id);
            return {
                status: 200,
                message: 'Token generated',
                token,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: `Failed to generate token: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createConversation(createConversationDto) {
        try {
            const result = await this.conversationService.createConversation(createConversationDto.friendly_name, createConversationDto.participants);
            return {
                status: 200,
                message: 'Conversation created successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createPrivateConversation(createPrivateConversationDto) {
        try {
            const result = await this.conversationService.createPrivateConversation(createPrivateConversationDto.user1, createPrivateConversationDto.user2);
            return {
                status: 200,
                message: 'Private conversation created successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addChatParticipant(convoSid, addParticipantDto) {
        try {
            const result = await this.conversationService.addChatParticipant(convoSid, addParticipantDto.identity);
            return {
                status: 200,
                message: 'Chat participant added successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addSmsParticipant(convoSid, addParticipantDto) {
        try {
            const result = await this.conversationService.addSmsParticipant(convoSid, addParticipantDto.phone_number);
            return {
                status: 200,
                message: 'SMS participant added successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendMessage(convoSid, sendMessageDto) {
        try {
            const result = await this.conversationService.sendMessage(convoSid, sendMessageDto.body, sendMessageDto.author, sendMessageDto.media);
            return {
                status: 200,
                message: 'Message sent successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listConversations(userId) {
        try {
            const conversations = await this.conversationService.listConversations(userId);
            return {
                status: 200,
                message: 'Conversations retrieved successfully',
                data: conversations,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMessages(convoSid) {
        try {
            const messages = await this.conversationService.getMessages(convoSid);
            return {
                status: 200,
                message: 'Messages retrieved successfully',
                data: messages,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMediaContent(mediaSid) {
        try {
            const media = await this.conversationService.getMediaContent(mediaSid);
            return {
                status: 200,
                message: 'Media content retrieved successfully',
                data: media,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteConversation(convoSid) {
        try {
            const result = await this.conversationService.deleteConversation(convoSid);
            return {
                status: 200,
                message: 'Conversation deleted successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async enableReachability() {
        try {
            const result = await this.conversationService.enableReachability();
            return {
                status: 200,
                message: 'Reachability enabled successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserReachability(identity) {
        try {
            const result = await this.conversationService.getUserReachability(identity);
            return {
                status: 200,
                message: 'User reachability retrieved successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserConversations(userId) {
        try {
            const conversations = await this.conversationService.listConversations(userId);
            return {
                status: 200,
                message: 'User conversations retrieved successfully',
                data: conversations,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ConversationController = ConversationController;
__decorate([
    (0, common_1.Post)('generate-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_token_dto_1.GenerateTokenDto]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "generateToken", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Post)('newconversation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [conversation_dto_1.CreatePrivateConversationDto]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "createPrivateConversation", null);
__decorate([
    (0, common_1.Post)(':convoSid/add-chat-participant'),
    __param(0, (0, common_1.Param)('convoSid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, conversation_dto_1.AddParticipantDto]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "addChatParticipant", null);
__decorate([
    (0, common_1.Post)(':convoSid/add-sms-participant'),
    __param(0, (0, common_1.Param)('convoSid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, conversation_dto_1.AddParticipantDto]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "addSmsParticipant", null);
__decorate([
    (0, common_1.Post)(':convoSid/send-message'),
    __param(0, (0, common_1.Param)('convoSid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, conversation_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "listConversations", null);
__decorate([
    (0, common_1.Get)(':convoSid/messages'),
    __param(0, (0, common_1.Param)('convoSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)('media/:mediaSid/content'),
    __param(0, (0, common_1.Param)('mediaSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getMediaContent", null);
__decorate([
    (0, common_1.Delete)(':convoSid'),
    __param(0, (0, common_1.Param)('convoSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('enable-reachability'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "enableReachability", null);
__decorate([
    (0, common_1.Get)('users/:identity/reachability'),
    __param(0, (0, common_1.Param)('identity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getUserReachability", null);
__decorate([
    (0, common_1.Get)(':userId/conversations'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getUserConversations", null);
exports.ConversationController = ConversationController = __decorate([
    (0, common_1.Controller)('conversations'),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService])
], ConversationController);
//# sourceMappingURL=conversation.controller.js.map