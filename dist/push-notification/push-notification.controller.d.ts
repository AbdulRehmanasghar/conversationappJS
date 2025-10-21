import { PushNotificationService } from './push-notification.service';
import { SendPushNotificationDto, SendGroupPushNotificationDto, SaveFcmTokenDto } from './dto/push-notification.dto';
export declare class PushNotificationController {
    private readonly pushNotificationService;
    constructor(pushNotificationService: PushNotificationService);
    sendPushNotification(sendPushNotificationDto: SendPushNotificationDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message_id: string;
            user_id: string;
        };
    }>;
    sendGroupPushNotification(sendGroupPushNotificationDto: SendGroupPushNotificationDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            success_count: number;
            failure_count: number;
            group_id: string;
            responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
        };
    }>;
    saveFcmToken(saveFcmTokenDto: SaveFcmTokenDto): Promise<{
        status: number;
        message: string;
        data: {
            user_id: string;
            fcm_token: string;
            device_type: string;
        };
    }>;
}
