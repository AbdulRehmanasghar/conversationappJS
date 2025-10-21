"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Twilio = require("twilio");
let TwilioService = class TwilioService {
    constructor(configService) {
        this.configService = configService;
        this.accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        this.apiKey = this.configService.get('TWILIO_API_KEY');
        this.apiSecret = this.configService.get('TWILIO_API_SECRET');
        this.serviceSid = this.configService.get('TWILIO_CHAT_SERVICE_SID');
        this.client = Twilio(this.apiKey, this.apiSecret, { accountSid: this.accountSid });
    }
    getClient() {
        return this.client;
    }
    getServiceSid() {
        return this.serviceSid;
    }
    getAccountSid() {
        return this.accountSid;
    }
    getApiKey() {
        return this.apiKey;
    }
    getApiSecret() {
        return this.apiSecret;
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map