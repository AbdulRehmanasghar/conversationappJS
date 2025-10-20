import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';
import { TwilioModule } from './twilio/twilio.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ConversationModule,
    TwilioModule,
    PushNotificationModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}