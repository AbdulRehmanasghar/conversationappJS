import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipantDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  image?: string; // base64 image
}

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  friendly_name?: string; // Made optional since it will be auto-generated

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  @IsOptional()
  participants?: ParticipantDto[];

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