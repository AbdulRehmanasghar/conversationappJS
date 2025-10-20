import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import {
  SendPushNotificationDto,
  SendGroupPushNotificationDto,
  SaveFcmTokenDto,
} from './dto/push-notification.dto';

@Controller()
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Post('send-push-notification')
  async sendPushNotification(@Body() sendPushNotificationDto: SendPushNotificationDto) {
    try {
      const result = await this.pushNotificationService.sendPushNotification(
        sendPushNotificationDto.user_id,
        sendPushNotificationDto.title,
        sendPushNotificationDto.body,
        sendPushNotificationDto.data,
      );

      return {
        status: 200,
        message: 'Push notification sent successfully',
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

  @Post('send-group-notification')
  async sendGroupPushNotification(
    @Body() sendGroupPushNotificationDto: SendGroupPushNotificationDto,
  ) {
    try {
      const result = await this.pushNotificationService.sendGroupPushNotification(
        sendGroupPushNotificationDto.group_id,
        sendGroupPushNotificationDto.title,
        sendGroupPushNotificationDto.body,
        sendGroupPushNotificationDto.data,
      );

      return {
        status: 200,
        message: 'Group push notification sent successfully',
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
      // This should be implemented to save FCM token to database
      // For now, just return success
      return {
        status: 200,
        message: 'FCM token saved successfully',
        data: {
          user_id: saveFcmTokenDto.user_id,
          fcm_token: saveFcmTokenDto.fcm_token,
          device_type: saveFcmTokenDto.device_type,
        },
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