import { Module, OnModuleInit } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ConversationModule } from '../conversation/conversation.module';
import { ConversationService } from '../conversation/conversation.service';

@Module({
  imports: [ConversationModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatGatewayModule implements OnModuleInit {
  constructor(
    private chatGateway: ChatGateway,
    private conversationService: ConversationService,
  ) {}

  onModuleInit() {
    // Set up the connection between services to avoid circular dependency
    this.conversationService.setChatGateway(this.chatGateway);
  }
}