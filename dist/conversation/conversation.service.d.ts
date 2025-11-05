import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../twilio/twilio.service';
export declare class ConversationService {
    private twilioService;
    private configService;
    private chatGateway;
    constructor(twilioService: TwilioService, configService: ConfigService);
    setChatGateway(chatGateway: any): void;
    generateToken(userId: string): Promise<string>;
    createConversation(friendlyName?: string, participants?: any[]): Promise<{
        success: boolean;
        conversation_sid: string;
        friendly_name: string;
        participants: any[];
    }>;
    createPrivateConversation(user1: string, user2: string): Promise<{
        success: boolean;
        conversation_sid: string;
        friendly_name: string;
        participants: string[];
        existing: boolean;
    }>;
    addChatParticipant(conversationSid: string, identity: string): Promise<{
        success: boolean;
        participant_sid: string;
        identity: string;
    }>;
    addSmsParticipant(conversationSid: string, phoneNumber: string): Promise<{
        success: boolean;
        participant_sid: string;
        phone_number: string;
    }>;
    sendMessage(conversationSid: string, body: string, author: string, media?: string[]): Promise<{
        success: boolean;
        message_sid: string;
        body: string;
        author: string;
        date_created: Date;
    }>;
    listConversations(userId?: string): Promise<any[]>;
    getMessages(conversationSid: string): Promise<{
        sid: string;
        body: string;
        author: string;
        date_created: Date;
        media: any[];
    }[]>;
    getMediaContent(mediaSid: string): Promise<{
        content_type: string;
        size: number;
        url: string;
    }>;
    deleteConversation(conversationSid: string): Promise<{
        success: boolean;
        message: string;
    }>;
    enableReachability(): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserReachability(identity: string): Promise<{
        identity: string;
        online: boolean;
        not_reachable: boolean;
    }>;
}
