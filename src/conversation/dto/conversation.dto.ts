import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  friendly_name: string;

  @IsArray()
  @IsOptional()
  participants?: string[];

  @IsString()
  @IsOptional()
  created_by?: string;
}

export class CreatePrivateConversationDto {
  @IsString()
  @IsNotEmpty()
  user1: string;

  @IsString()
  @IsNotEmpty()
  user2: string;
}

export class AddParticipantDto {
  @IsString()
  @IsNotEmpty()
  identity: string;

  @IsString()
  @IsOptional()
  phone_number?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsArray()
  @IsOptional()
  media?: string[];
}