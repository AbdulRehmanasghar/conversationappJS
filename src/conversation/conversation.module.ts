import { Module } from "@nestjs/common";
import { ConversationController } from "./conversation.controller";
import { ConversationService } from "./conversation.service";
import { TwilioModule } from "../twilio/twilio.module";
import { FileUploadModule } from "../file-upload/file-upload.module";

@Module({
  imports: [TwilioModule, FileUploadModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
