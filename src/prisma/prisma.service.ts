import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Temporarily disable database connection for testing
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.warn('⚠️ Database connection failed, running without database:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}