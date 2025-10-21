"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const prisma_module_1 = require("./prisma/prisma.module");
const conversation_module_1 = require("./conversation/conversation.module");
const twilio_module_1 = require("./twilio/twilio.module");
const push_notification_module_1 = require("./push-notification/push-notification.module");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const chat_gateway_module_1 = require("./chat-gateway/chat-gateway.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..'),
                serveRoot: '/',
                exclude: ['/api*'],
            }),
            prisma_module_1.PrismaModule,
            conversation_module_1.ConversationModule,
            twilio_module_1.TwilioModule,
            push_notification_module_1.PushNotificationModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            chat_gateway_module_1.ChatGatewayModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map