import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SendPushNotificationDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}

export class SendGroupPushNotificationDto {
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}

export class SaveFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  fcm_token: string;

  @IsString()
  @IsOptional()
  device_type?: string;
}