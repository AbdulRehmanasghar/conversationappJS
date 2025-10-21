export interface TwilioUser {
    id: number;
    identity: string;
    friendlyName?: string;
    email?: string;
    phoneNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserFcmToken {
    id: number;
    userId: string;
    fcmToken: string;
    deviceType?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Group {
    id: number;
    groupId: string;
    groupName: string;
    conversationSid?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface GroupParticipant {
    id: number;
    groupId: string;
    userId: string;
    createdAt: Date;
}
