import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TwilioService } from '../twilio/twilio.service';
import { CreateTwilioUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private twilioService: TwilioService,
  ) {}

  async createTwilioUser(createTwilioUserDto: CreateTwilioUserDto) {
    try {
      // Create user in Twilio
      const twilioUser = await this.twilioService
        .getClient()
        .conversations.v1.services(this.twilioService.getServiceSid())
        .users.create({
          identity: createTwilioUserDto.identity,
          friendlyName: createTwilioUserDto.friendly_name || createTwilioUserDto.identity,
        });

      // Save user to database using Prisma
      const savedUser = await this.prismaService.twilioUser.create({
        data: {
          identity: createTwilioUserDto.identity,
          friendlyName: createTwilioUserDto.friendly_name,
          email: createTwilioUserDto.email,
          phoneNumber: createTwilioUserDto.phone_number,
        },
      });

      return {
        success: true,
        twilio_user: {
          sid: twilioUser.sid,
          identity: twilioUser.identity,
          friendly_name: twilioUser.friendlyName,
        },
        database_user: savedUser,
      };
    } catch (error) {
      throw new Error(`Failed to create Twilio user: ${error.message}`);
    }
  }

  async getAllTwilioUsers() {
    try {
      const users = await this.prismaService.twilioUser.findMany();
      return users;
    } catch (error) {
      throw new Error(`Failed to get Twilio users: ${error.message}`);
    }
  }

  async deleteTwilioUser(id: number) {
    try {
      const user = await this.prismaService.twilioUser.findUnique({ 
        where: { id } 
      });
      
      if (!user) {
        throw new Error('User not found');
      }

      // Delete user from Twilio
      try {
        await this.twilioService
          .getClient()
          .conversations.v1.services(this.twilioService.getServiceSid())
          .users(user.identity)
          .remove();
      } catch (twilioError) {
        // Log error but continue with database deletion
        console.warn(`Failed to delete user from Twilio: ${twilioError.message}`);
      }

      // Delete user from database using Prisma
      await this.prismaService.twilioUser.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete Twilio user: ${error.message}`);
    }
  }

  async saveFcmToken(userId: string, fcmToken: string, deviceType?: string) {
    try {
      // Check if token already exists for this user
      const existingToken = await this.prismaService.userFcmToken.findFirst({
        where: { 
          userId: userId, 
          fcmToken: fcmToken 
        },
      });

      if (existingToken) {
        // Update existing token
        const updatedToken = await this.prismaService.userFcmToken.update({
          where: { id: existingToken.id },
          data: { deviceType },
        });
        
        return {
          success: true,
          message: 'FCM token updated successfully',
          data: updatedToken,
        };
      }

      // Create new token
      const savedToken = await this.prismaService.userFcmToken.create({
        data: {
          userId,
          fcmToken,
          deviceType,
        },
      });

      return {
        success: true,
        message: 'FCM token saved successfully',
        data: savedToken,
      };
    } catch (error) {
      throw new Error(`Failed to save FCM token: ${error.message}`);
    }
  }

  async getFcmTokensByUserId(userId: string): Promise<string[]> {
    try {
      const tokens = await this.prismaService.userFcmToken.findMany({
        where: { userId },
      });

      return tokens.map(token => token.fcmToken);
    } catch (error) {
      throw new Error(`Failed to get FCM tokens: ${error.message}`);
    }
  }

  async syncGroupsToConversations(groups: any[]) {
    const results = [];
    
    for (const group of groups) {
      try {
        // Create conversation for the group
        const conversation = await this.twilioService
          .getClient()
          .conversations.v1.conversations.create({
            friendlyName: group.group_name,
            uniqueName: `group_${group.group_id}`,
          });

        results.push({
          group_id: group.group_id,
          conversation_sid: conversation.sid,
          success: true,
        });
      } catch (error) {
        results.push({
          group_id: group.group_id,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: 'Groups synchronized to conversations',
      results,
    };
  }

  async addParticipantsToGroup(groupId: string, participants: string[]) {
    try {
      const conversationUniqueName = `group_${groupId}`;
      
      // Find the conversation by unique name
      const conversations = await this.twilioService
        .getClient()
        .conversations.v1.conversations.list();
      
      const conversation = conversations.find(c => c.uniqueName === conversationUniqueName);
      
      if (!conversation) {
        throw new Error('Group conversation not found');
      }

      const results = [];
      
      for (const participant of participants) {
        try {
          await this.twilioService
            .getClient()
            .conversations.v1.conversations(conversation.sid)
            .participants.create({ identity: participant });
          
          results.push({
            participant,
            success: true,
          });
        } catch (error) {
          results.push({
            participant,
            success: false,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        message: 'Participants added to group',
        group_id: groupId,
        conversation_sid: conversation.sid,
        results,
      };
    } catch (error) {
      throw new Error(`Failed to add participants to group: ${error.message}`);
    }
  }

  async deleteAllGroups() {
    try {
      const conversations = await this.twilioService
        .getClient()
        .conversations.v1.conversations.list();
      
      const groupConversations = conversations.filter(c => 
        c.uniqueName && c.uniqueName.startsWith('group_')
      );

      const results = [];
      
      for (const conversation of groupConversations) {
        try {
          await this.twilioService
            .getClient()
            .conversations.v1.conversations(conversation.sid)
            .remove();
          
          results.push({
            conversation_sid: conversation.sid,
            unique_name: conversation.uniqueName,
            success: true,
          });
        } catch (error) {
          results.push({
            conversation_sid: conversation.sid,
            unique_name: conversation.uniqueName,
            success: false,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        message: 'All group conversations deleted',
        deleted_count: results.filter(r => r.success).length,
        results,
      };
    } catch (error) {
      throw new Error(`Failed to delete all groups: ${error.message}`);
    }
  }
}