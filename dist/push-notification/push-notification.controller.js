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
exports.PushNotificationController = void 0;
const common_1 = require("@nestjs/common");
const push_notification_service_1 = require("./push-notification.service");
const push_notification_dto_1 = require("./dto/push-notification.dto");
let PushNotificationController = class PushNotificationController {
    constructor(pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }
    async sendPushNotification(sendPushNotificationDto) {
        try {
            const result = await this.pushNotificationService.sendPushNotification(sendPushNotificationDto.user_id, sendPushNotificationDto.title, sendPushNotificationDto.body, sendPushNotificationDto.data);
            return {
                status: 200,
                message: 'Push notification sent successfully',
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
    async sendGroupPushNotification(sendGroupPushNotificationDto) {
        try {
            const result = await this.pushNotificationService.sendGroupPushNotification(sendGroupPushNotificationDto.group_id, sendGroupPushNotificationDto.title, sendGroupPushNotificationDto.body, sendGroupPushNotificationDto.data);
            return {
                status: 200,
                message: 'Group push notification sent successfully',
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
            return {
                status: 200,
                message: 'FCM token saved successfully',
                data: {
                    user_id: saveFcmTokenDto.user_id,
                    fcm_token: saveFcmTokenDto.fcm_token,
                    device_type: saveFcmTokenDto.device_type,
                },
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
exports.PushNotificationController = PushNotificationController;
__decorate([
    (0, common_1.Post)('send-push-notification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [push_notification_dto_1.SendPushNotificationDto]),
    __metadata("design:returntype", Promise)
], PushNotificationController.prototype, "sendPushNotification", null);
__decorate([
    (0, common_1.Post)('send-group-notification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [push_notification_dto_1.SendGroupPushNotificationDto]),
    __metadata("design:returntype", Promise)
], PushNotificationController.prototype, "sendGroupPushNotification", null);
__decorate([
    (0, common_1.Post)('save-fcm-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [push_notification_dto_1.SaveFcmTokenDto]),
    __metadata("design:returntype", Promise)
], PushNotificationController.prototype, "saveFcmToken", null);
exports.PushNotificationController = PushNotificationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [push_notification_service_1.PushNotificationService])
], PushNotificationController);
//# sourceMappingURL=push-notification.controller.js.map