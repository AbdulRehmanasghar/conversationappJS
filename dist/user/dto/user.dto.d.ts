export declare class CreateTwilioUserDto {
    identity: string;
    friendly_name?: string;
    email?: string;
    phone_number?: string;
}
export declare class SyncGroupsDto {
    group_id: string;
    group_name: string;
    created_by: string;
}
export declare class AddParticipantsDto {
    group_id: string;
    user_id: string;
}
