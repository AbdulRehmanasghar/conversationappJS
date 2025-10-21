export declare class SendPushNotificationDto {
    user_id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
}
export declare class SendGroupPushNotificationDto {
    group_id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
}
export declare class SaveFcmTokenDto {
    user_id: string;
    fcm_token: string;
    device_type?: string;
}
