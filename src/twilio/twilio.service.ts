import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;
  private accountSid: string;
  private apiKey: string;
  private apiSecret: string;
  private serviceSid: string;

  constructor(private configService: ConfigService) {
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.apiKey = this.configService.get<string>('TWILIO_API_KEY');
    this.apiSecret = this.configService.get<string>('TWILIO_API_SECRET');
    this.serviceSid = this.configService.get<string>('TWILIO_CHAT_SERVICE_SID');
    
    this.client = Twilio(this.apiKey, this.apiSecret, { accountSid: this.accountSid });
  }

  getClient(): Twilio.Twilio {
    return this.client;
  }

  getServiceSid(): string {
    return this.serviceSid;
  }

  getAccountSid(): string {
    return this.accountSid;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getApiSecret(): string {
    return this.apiSecret;
  }
}