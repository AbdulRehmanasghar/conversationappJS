import { ConfigService } from '@nestjs/config';
export declare class PushNotificationService {
    private configService;
    constructor(configService: ConfigService);
    private initializeFirebase;
    sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>): Promise<{
        success: boolean;
        message_id: string;
        user_id: string;
    }>;
    sendGroupPushNotification(groupId: string, title: string, body: string, data?: Record<string, any>): Promise<{
        success: boolean;
        success_count: number;
        failure_count: number;
        group_id: string;
        responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
    }>;
    sendToTopic(topic: string, title: string, body: string, data?: Record<string, any>): Promise<{
        success: boolean;
        message_id: string;
        topic: string;
    }>;
    subscribeToTopic(fcmToken: string, topic: string): Promise<{
        success: boolean;
        success_count: number;
        failure_count: number;
    }>;
    unsubscribeFromTopic(fcmToken: string, topic: string): Promise<{
        success: boolean;
        success_count: number;
        failure_count: number;
    }>;
    private getFcmTokenByUserId;
    private getFcmTokensByGroupId;
}
