import { PrismaService } from '../prisma/prisma.service';
import { TwilioService } from '../twilio/twilio.service';
import { CreateTwilioUserDto } from './dto/user.dto';
export declare class UserService {
    private prismaService;
    private twilioService;
    constructor(prismaService: PrismaService, twilioService: TwilioService);
    createTwilioUser(createTwilioUserDto: CreateTwilioUserDto): Promise<{
        success: boolean;
        twilio_user: {
            sid: string;
            identity: string;
            friendly_name: string;
        };
        database_user: {
            friendlyName: string | null;
            identity: string;
            email: string | null;
            phoneNumber: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
        };
    }>;
    getAllTwilioUsers(): Promise<{
        friendlyName: string | null;
        identity: string;
        email: string | null;
        phoneNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    deleteTwilioUser(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    saveFcmToken(userId: string, fcmToken: string, deviceType?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            fcmToken: string;
            deviceType: string | null;
        };
    }>;
    getFcmTokensByUserId(userId: string): Promise<string[]>;
    syncGroupsToConversations(groups: any[]): Promise<{
        success: boolean;
        message: string;
        results: any[];
    }>;
    addParticipantsToGroup(groupId: string, participants: string[]): Promise<{
        success: boolean;
        message: string;
        group_id: string;
        conversation_sid: string;
        results: any[];
    }>;
    deleteAllGroups(): Promise<{
        success: boolean;
        message: string;
        deleted_count: number;
        results: any[];
    }>;
}
