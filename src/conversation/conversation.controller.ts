import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ConversationService } from "./conversation.service";
import { GenerateTokenDto } from "./dto/generate-token.dto";
import {
  CreateConversationDto,
  CreatePrivateConversationDto,
  AddParticipantDto,
  SendMessageDto,
  SendMessageWithFilesDto,
} from "./dto/conversation.dto";

@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post("generate-token")
  async generateToken(@Body() generateTokenDto: GenerateTokenDto) {
    try {
      const token = await this.conversationService.generateToken(
        generateTokenDto.user_id
      );

      return {
        status: 200,
        message: "Token generated",
        token,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: `Failed to generate token: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("create")
  async createConversation(
    @Body() createConversationDto: CreateConversationDto
  ) {
    try {
      const result = await this.conversationService.createConversation(
        createConversationDto.friendly_name,
        createConversationDto.participants
      );

      return {
        status: 200,
        message: "Conversation created successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("newconversation")
  async createPrivateConversation(
    @Body() createConversationDto: CreateConversationDto
  ) {
    try {
      const result = await this.conversationService.createPrivateConversation(
        createConversationDto.friendly_name,
        createConversationDto.participants
      );

      return {
        status: 200,
        message: "Private conversation created successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(":convoSid/add-chat-participant")
  async addChatParticipant(
    @Param("convoSid") convoSid: string,
    @Body() addParticipantDto: AddParticipantDto
  ) {
    try {
      const result = await this.conversationService.addChatParticipant(
        convoSid,
        addParticipantDto.identity
      );

      return {
        status: 200,
        message: "Chat participant added successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(":convoSid/add-sms-participant")
  async addSmsParticipant(
    @Param("convoSid") convoSid: string,
    @Body() addParticipantDto: AddParticipantDto
  ) {
    try {
      const result = await this.conversationService.addSmsParticipant(
        convoSid,
        addParticipantDto.phone_number
      );

      return {
        status: 200,
        message: "SMS participant added successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(":convoSid/send-message")
  async sendMessage(
    @Param("convoSid") convoSid: string,
    @Body() sendMessageDto: SendMessageDto
  ) {
    try {
      const result = await this.conversationService.sendMessage(
        convoSid,
        sendMessageDto.body,
        sendMessageDto.author,
        sendMessageDto.media
      );

      return {
        status: 200,
        message: "Message sent successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(":convoSid/send-message-with-files")
  @UseInterceptors(FilesInterceptor("files", 10)) // Max 10 files
  async sendMessageWithFiles(
    @Param("convoSid") convoSid: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() sendMessageDto: SendMessageWithFilesDto
  ) {
    try {
      const result =
        await this.conversationService.sendMessageWithUploadedFiles(
          convoSid,
          sendMessageDto.body,
          sendMessageDto.author,
          files || []
        );

      return {
        status: 200,
        message: "Message with files sent successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async listConversations(@Query("userId") userId?: string) {
    try {
      const conversations =
        await this.conversationService.listConversations(userId);

      return {
        status: 200,
        message: "Conversations retrieved successfully",
        data: conversations,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":convoSid/messages")
  async getMessages(@Param("convoSid") convoSid: string) {
    try {
      const messages = await this.conversationService.getMessages(convoSid);

      return {
        status: 200,
        message: "Messages retrieved successfully",
        data: messages,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("media/:mediaSid/content")
  async getMediaContent(@Param("mediaSid") mediaSid: string) {
    try {
      const media = await this.conversationService.getMediaContent(mediaSid);

      return {
        status: 200,
        message: "Media content retrieved successfully",
        data: media,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":convoSid")
  async deleteConversation(@Param("convoSid") convoSid: string) {
    try {
      const result =
        await this.conversationService.deleteConversation(convoSid);

      return {
        status: 200,
        message: "Conversation deleted successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("enable-reachability")
  async enableReachability() {
    try {
      const result = await this.conversationService.enableReachability();

      return {
        status: 200,
        message: "Reachability enabled successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("users/:identity/reachability")
  async getUserReachability(@Param("identity") identity: string) {
    try {
      const result =
        await this.conversationService.getUserReachability(identity);

      return {
        status: 200,
        message: "User reachability retrieved successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":userId/conversations")
  async getUserConversations(@Param("userId") userId: string) {
    try {
      const conversations =
        await this.conversationService.listConversations(userId);

      return {
        status: 200,
        message: "User conversations retrieved successfully",
        data: conversations,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
