export declare class CreateConversationDto {
    friendly_name: string;
    participants?: string[];
    created_by?: string;
}
export declare class CreatePrivateConversationDto {
    user1: string;
    user2: string;
}
export declare class AddParticipantDto {
    identity: string;
    phone_number?: string;
}
export declare class SendMessageDto {
    body: string;
    author: string;
    media?: string[];
}
