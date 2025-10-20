import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { 
  CreateTwilioUserDto, 
  SyncGroupsDto, 
  AddParticipantsDto 
} from './dto/user.dto';
import { SaveFcmTokenDto } from '../push-notification/dto/push-notification.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('twilio_users')
  async createTwilioUser(@Body() createTwilioUserDto: CreateTwilioUserDto) {
    try {
      const result = await this.userService.createTwilioUser(createTwilioUserDto);

      return {
        status: 200,
        message: 'Twilio user created successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('twilio_users')
  async getAllTwilioUsers() {
    try {
      const users = await this.userService.getAllTwilioUsers();

      return {
        status: 200,
        message: 'Twilio users retrieved successfully',
        data: users,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('twilio-users/:id')
  async deleteTwilioUser(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.userService.deleteTwilioUser(id);

      return {
        status: 200,
        message: 'Twilio user deleted successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('save-fcm-token')
  async saveFcmToken(@Body() saveFcmTokenDto: SaveFcmTokenDto) {
    try {
      const result = await this.userService.saveFcmToken(
        saveFcmTokenDto.user_id,
        saveFcmTokenDto.fcm_token,
        saveFcmTokenDto.device_type,
      );

      return {
        status: 200,
        message: 'FCM token saved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sync-groups')
  async syncGroupsToConversations(@Body() syncGroupsDto: SyncGroupsDto[]) {
    try {
      const result = await this.userService.syncGroupsToConversations(syncGroupsDto);

      return {
        status: 200,
        message: 'Groups synchronized successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('add-group-participants')
  async addParticipantsToGroup(@Body() addParticipantsDto: AddParticipantsDto) {
    try {
      const result = await this.userService.addParticipantsToGroup(
        addParticipantsDto.group_id,
        [addParticipantsDto.user_id],
      );

      return {
        status: 200,
        message: 'Participants added to group successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete-all-groups')
  async deleteAllGroups() {
    try {
      const result = await this.userService.deleteAllGroups();

      return {
        status: 200,
        message: 'All groups deleted successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}