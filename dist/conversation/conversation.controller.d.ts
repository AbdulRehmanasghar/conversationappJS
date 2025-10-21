import { ConversationService } from './conversation.service';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { CreateConversationDto, CreatePrivateConversationDto, AddParticipantDto, SendMessageDto } from './dto/conversation.dto';
export declare class ConversationController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    generateToken(generateTokenDto: GenerateTokenDto): Promise<{
        status: number;
        message: string;
        token: string;
    }>;
    createConversation(createConversationDto: CreateConversationDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            conversation_sid: string;
            friendly_name: string;
            participants: string[];
        };
    }>;
    createPrivateConversation(createPrivateConversationDto: CreatePrivateConversationDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            conversation_sid: string;
            friendly_name: string;
            participants: string[];
            existing: boolean;
        };
    }>;
    addChatParticipant(convoSid: string, addParticipantDto: AddParticipantDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            participant_sid: string;
            identity: string;
        };
    }>;
    addSmsParticipant(convoSid: string, addParticipantDto: AddParticipantDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            participant_sid: string;
            phone_number: string;
        };
    }>;
    sendMessage(convoSid: string, sendMessageDto: SendMessageDto): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message_sid: string;
            body: string;
            author: string;
            date_created: Date;
        };
    }>;
    listConversations(userId?: string): Promise<{
        status: number;
        message: string;
        data: any[];
    }>;
    getMessages(convoSid: string): Promise<{
        status: number;
        message: string;
        data: {
            sid: string;
            body: string;
            author: string;
            date_created: Date;
            media: any[];
        }[];
    }>;
    getMediaContent(mediaSid: string): Promise<{
        status: number;
        message: string;
        data: {
            content_type: string;
            size: number;
            url: string;
        };
    }>;
    deleteConversation(convoSid: string): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message: string;
        };
    }>;
    enableReachability(): Promise<{
        status: number;
        message: string;
        data: {
            success: boolean;
            message: string;
        };
    }>;
    getUserReachability(identity: string): Promise<{
        status: number;
        message: string;
        data: {
            identity: string;
            online: boolean;
            not_reachable: boolean;
        };
    }>;
    getUserConversations(userId: string): Promise<{
        status: number;
        message: string;
        data: any[];
    }>;
}
