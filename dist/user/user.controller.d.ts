import { UserService } from './user.service';
import { CreateTwilioUserDto, SyncGroupsDto, AddParticipantsDto } from './dto/user.dto';
import { SaveFcmTokenDto } from '../push-notification/dto/push-notification.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createTwilioUser(createTwilioUserDto: CreateTwilioUserDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            twilio_user: {
                sid: string;
                identity: string;
                friendly_name: string;
            };
            database_user: {
                identity: string;
                friendlyName: string | null;
                email: string | null;
                phoneNumber: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: number;
            };
        };
    }>;
    getAllTwilioUsers(): Promise<{
        status: number;
        message: string;
        data: {
            identity: string;
            friendlyName: string | null;
            email: string | null;
            phoneNumber: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
        }[];
    }>;
    deleteTwilioUser(id: number): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message: string;
        };
    }>;
    saveFcmToken(saveFcmTokenDto: SaveFcmTokenDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message: string;
            data: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                userId: string;
                fcmToken: string;
                deviceType: string | null;
            };
        };
    }>;
    syncGroupsToConversations(syncGroupsDto: SyncGroupsDto[]): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message: string;
            results: any[];
        };
    }>;
    addParticipantsToGroup(addParticipantsDto: AddParticipantsDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message: string;
            group_id: string;
            conversation_sid: string;
            results: any[];
        };
    }>;
    deleteAllGroups(): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message: string;
            deleted_count: number;
            results: any[];
        };
    }>;
}
