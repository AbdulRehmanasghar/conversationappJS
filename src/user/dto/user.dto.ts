import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateTwilioUserDto {
  @IsString()
  @IsNotEmpty()
  identity: string;

  @IsString()
  @IsOptional()
  friendly_name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;
}

export class SyncGroupsDto {
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @IsString()
  @IsNotEmpty()
  group_name: string;

  @IsString()
  @IsNotEmpty()
  created_by: string;
}

export class AddParticipantsDto {
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;
}