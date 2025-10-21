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
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
let PushNotificationService = class PushNotificationService {
    constructor(configService) {
        this.configService = configService;
        this.initializeFirebase();
    }
    initializeFirebase() {
        const firebaseCredentialsPath = this.configService.get('FIREBASE_CREDENTIALS');
        if (!admin.apps.length) {
            const serviceAccount = require(`../../${firebaseCredentialsPath}`);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    }
    async sendPushNotification(userId, title, body, data) {
        try {
            const fcmToken = await this.getFcmTokenByUserId(userId);
            if (!fcmToken) {
                throw new Error('FCM token not found for user');
            }
            const message = {
                notification: {
                    title,
                    body,
                },
                data: data || {},
                token: fcmToken,
            };
            const response = await admin.messaging().send(message);
            return {
                success: true,
                message_id: response,
                user_id: userId,
            };
        }
        catch (error) {
            throw new Error(`Failed to send push notification: ${error.message}`);
        }
    }
    async sendGroupPushNotification(groupId, title, body, data) {
        try {
            const fcmTokens = await this.getFcmTokensByGroupId(groupId);
            if (!fcmTokens || fcmTokens.length === 0) {
                throw new Error('No FCM tokens found for group members');
            }
            const message = {
                notification: {
                    title,
                    body,
                },
                data: {
                    group_id: groupId,
                    ...data,
                },
                tokens: fcmTokens,
            };
            const response = await admin.messaging().sendMulticast(message);
            return {
                success: true,
                success_count: response.successCount,
                failure_count: response.failureCount,
                group_id: groupId,
                responses: response.responses,
            };
        }
        catch (error) {
            throw new Error(`Failed to send group push notification: ${error.message}`);
        }
    }
    async sendToTopic(topic, title, body, data) {
        try {
            const message = {
                notification: {
                    title,
                    body,
                },
                data: data || {},
                topic,
            };
            const response = await admin.messaging().send(message);
            return {
                success: true,
                message_id: response,
                topic,
            };
        }
        catch (error) {
            throw new Error(`Failed to send topic notification: ${error.message}`);
        }
    }
    async subscribeToTopic(fcmToken, topic) {
        try {
            const response = await admin.messaging().subscribeToTopic([fcmToken], topic);
            return {
                success: true,
                success_count: response.successCount,
                failure_count: response.failureCount,
            };
        }
        catch (error) {
            throw new Error(`Failed to subscribe to topic: ${error.message}`);
        }
    }
    async unsubscribeFromTopic(fcmToken, topic) {
        try {
            const response = await admin.messaging().unsubscribeFromTopic([fcmToken], topic);
            return {
                success: true,
                success_count: response.successCount,
                failure_count: response.failureCount,
            };
        }
        catch (error) {
            throw new Error(`Failed to unsubscribe from topic: ${error.message}`);
        }
    }
    async getFcmTokenByUserId(userId) {
        return null;
    }
    async getFcmTokensByGroupId(groupId) {
        return [];
    }
};
exports.PushNotificationService = PushNotificationService;
exports.PushNotificationService = PushNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PushNotificationService);
//# sourceMappingURL=push-notification.service.js.map