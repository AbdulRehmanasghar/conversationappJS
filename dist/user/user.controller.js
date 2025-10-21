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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_dto_1 = require("./dto/user.dto");
const push_notification_dto_1 = require("../push-notification/dto/push-notification.dto");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async createTwilioUser(createTwilioUserDto) {
        try {
            const result = await this.userService.createTwilioUser(createTwilioUserDto);
            return {
                status: 200,
                message: 'Twilio user created successfully',
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
    async getAllTwilioUsers() {
        try {
            const users = await this.userService.getAllTwilioUsers();
            return {
                status: 200,
                message: 'Twilio users retrieved successfully',
                data: users,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 500,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteTwilioUser(id) {
        try {
            const result = await this.userService.deleteTwilioUser(id);
            return {
                status: 200,
                message: 'Twilio user deleted successfully',
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
    async saveFcmToken(saveFcmTokenDto) {
        try {
            const result = await this.userService.saveFcmToken(saveFcmTokenDto.user_id, saveFcmTokenDto.fcm_token, saveFcmTokenDto.device_type);
            return {
                status: 200,
                message: 'FCM token saved successfully',
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
    async syncGroupsToConversations(syncGroupsDto) {
        try {
            const result = await this.userService.syncGroupsToConversations(syncGroupsDto);
            return {
                status: 200,
                message: 'Groups synchronized successfully',
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
    async addParticipantsToGroup(addParticipantsDto) {
        try {
            const result = await this.userService.addParticipantsToGroup(addParticipantsDto.group_id, [addParticipantsDto.user_id]);
            return {
                status: 200,
                message: 'Participants added to group successfully',
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
    async deleteAllGroups() {
        try {
            const result = await this.userService.deleteAllGroups();
            return {
                status: 200,
                message: 'All groups deleted successfully',
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
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('twilio_users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateTwilioUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createTwilioUser", null);
__decorate([
    (0, common_1.Get)('twilio_users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllTwilioUsers", null);
__decorate([
    (0, common_1.Delete)('twilio-users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteTwilioUser", null);
__decorate([
    (0, common_1.Post)('save-fcm-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [push_notification_dto_1.SaveFcmTokenDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "saveFcmToken", null);
__decorate([
    (0, common_1.Post)('sync-groups'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "syncGroupsToConversations", null);
__decorate([
    (0, common_1.Post)('add-group-participants'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.AddParticipantsDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addParticipantsToGroup", null);
__decorate([
    (0, common_1.Delete)('delete-all-groups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteAllGroups", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map