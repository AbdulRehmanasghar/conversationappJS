import { OnModuleInit } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ConversationService } from '../conversation/conversation.service';
export declare class ChatGatewayModule implements OnModuleInit {
    private chatGateway;
    private conversationService;
    constructor(chatGateway: ChatGateway, conversationService: ConversationService);
    onModuleInit(): void;
}
