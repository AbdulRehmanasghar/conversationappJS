import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';
import { TwilioModule } from './twilio/twilio.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatGatewayModule } from './chat-gateway/chat-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    PrismaModule,
    ConversationModule,
    TwilioModule,
    PushNotificationModule,
    UserModule,
    AuthModule,
    ChatGatewayModule,
  ],
})
export class AppModule {}