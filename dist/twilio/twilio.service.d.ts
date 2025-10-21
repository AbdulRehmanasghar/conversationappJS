import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';
export declare class TwilioService {
    private configService;
    private client;
    private accountSid;
    private apiKey;
    private apiSecret;
    private serviceSid;
    constructor(configService: ConfigService);
    getClient(): Twilio.Twilio;
    getServiceSid(): string;
    getAccountSid(): string;
    getApiKey(): string;
    getApiSecret(): string;
}
