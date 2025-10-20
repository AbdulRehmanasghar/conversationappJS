import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../twilio/twilio.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ConversationService {
  constructor(
    private twilioService: TwilioService,
    private configService: ConfigService,
  ) {}

  async generateToken(userId: string): Promise<string> {
    const AccessToken = require('twilio').jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;

    const identity = `user_${userId}`;
    
    const token = new AccessToken(
      this.twilioService.getAccountSid(),
      this.twilioService.getApiKey(),
      this.twilioService.getApiSecret(),
      { ttl: 3600, identity }
    );

    const chatGrant = new ChatGrant({
      serviceSid: this.twilioService.getServiceSid(),
    });

    token.addGrant(chatGrant);
    return token.toJwt();
  }

  async createConversation(friendlyName: string, participants?: string[]) {
    try {
      const conversation = await this.twilioService
        .getClient()
        .conversations.v1.conversations.create({
          friendlyName,
        });

      if (participants && participants.length > 0) {
        for (const participant of participants) {
          await this.addChatParticipant(conversation.sid, participant);
        }
      }

      return {
        success: true,
        conversation_sid: conversation.sid,
        friendly_name: conversation.friendlyName,
        participants: participants || [],
      };
    } catch (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  }

  async createPrivateConversation(user1: string, user2: string) {
    const uniqueName = [user1, user2].sort().join('_');
    
    try {
      // Check if conversation already exists
      const conversations = await this.twilioService
        .getClient()
        .conversations.v1.conversations.list({ limit: 1000 });
      
      const existingConvo = conversations.find(c => c.uniqueName === uniqueName);
      
      if (existingConvo) {
        return {
          success: true,
          conversation_sid: existingConvo.sid,
          friendly_name: existingConvo.friendlyName,
          participants: [user1, user2],
          existing: true,
        };
      }

      // Create new conversation
      const conversation = await this.twilioService
        .getClient()
        .conversations.v1.conversations.create({
          friendlyName: `Private: ${user1} & ${user2}`,
          uniqueName,
        });

      // Add participants
      await this.addChatParticipant(conversation.sid, user1);
      await this.addChatParticipant(conversation.sid, user2);

      return {
        success: true,
        conversation_sid: conversation.sid,
        friendly_name: conversation.friendlyName,
        participants: [user1, user2],
        existing: false,
      };
    } catch (error) {
      throw new Error(`Failed to create private conversation: ${error.message}`);
    }
  }

  async addChatParticipant(conversationSid: string, identity: string) {
    try {
      const participant = await this.twilioService
        .getClient()
        .conversations.v1.conversations(conversationSid)
        .participants.create({ identity });

      return {
        success: true,
        participant_sid: participant.sid,
        identity: participant.identity,
      };
    } catch (error) {
      throw new Error(`Failed to add chat participant: ${error.message}`);
    }
  }

  async addSmsParticipant(conversationSid: string, phoneNumber: string) {
    try {
      const participant = await this.twilioService
        .getClient()
        .conversations.v1.conversations(conversationSid)
        .participants.create({ 
          'messagingBinding.address': phoneNumber,
          'messagingBinding.proxyAddress': this.configService.get('TWILIO_PHONE_NUMBER')
        });

      return {
        success: true,
        participant_sid: participant.sid,
        phone_number: phoneNumber,
      };
    } catch (error) {
      throw new Error(`Failed to add SMS participant: ${error.message}`);
    }
  }

  async sendMessage(conversationSid: string, body: string, author: string, media?: string[]) {
    try {
      const messageData: any = { body, author };
      
      if (media && media.length > 0) {
        messageData.media = media;
      }

      const message = await this.twilioService
        .getClient()
        .conversations.v1.conversations(conversationSid)
        .messages.create(messageData);

      return {
        success: true,
        message_sid: message.sid,
        body: message.body,
        author: message.author,
        date_created: message.dateCreated,
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async listConversations(userId?: string) {
    try {
      const conversations = await this.twilioService
        .getClient()
        .conversations.v1.conversations.list({ limit: 1000 });

      if (userId) {
        // Filter conversations where user is a participant
        const userConversations = [];
        for (const conversation of conversations) {
          const participants = await this.twilioService
            .getClient()
            .conversations.v1.conversations(conversation.sid)
            .participants.list();
          
          const hasUser = participants.some(p => p.identity === userId);
          if (hasUser) {
            userConversations.push({
              sid: conversation.sid,
              friendly_name: conversation.friendlyName,
              date_created: conversation.dateCreated,
              date_updated: conversation.dateUpdated,
            });
          }
        }
        return userConversations;
      }

      return conversations.map(conversation => ({
        sid: conversation.sid,
        friendly_name: conversation.friendlyName,
        date_created: conversation.dateCreated,
        date_updated: conversation.dateUpdated,
      }));
    } catch (error) {
      throw new Error(`Failed to list conversations: ${error.message}`);
    }
  }

  async getMessages(conversationSid: string) {
    try {
      const messages = await this.twilioService
        .getClient()
        .conversations.v1.conversations(conversationSid)
        .messages.list({ limit: 100 });

      return messages.map(message => ({
        sid: message.sid,
        body: message.body,
        author: message.author,
        date_created: message.dateCreated,
        media: message.media,
      }));
    } catch (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }

  async getMediaContent(mediaSid: string) {
    try {
      // Note: This is a placeholder for media content retrieval
      // The actual implementation depends on your specific Twilio setup
      return {
        content_type: 'application/octet-stream',
        size: 0,
        url: `https://media.twiliocdn.com/${mediaSid}`,
      };
    } catch (error) {
      throw new Error(`Failed to get media content: ${error.message}`);
    }
  }

  async deleteConversation(conversationSid: string) {
    try {
      await this.twilioService
        .getClient()
        .conversations.v1.conversations(conversationSid)
        .remove();

      return { success: true, message: 'Conversation deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  async enableReachability() {
    try {
      // Note: This is a placeholder for enabling reachability
      // The actual implementation may vary based on your Twilio service configuration
      return { success: true, message: 'Reachability feature configured' };
    } catch (error) {
      throw new Error(`Failed to enable reachability: ${error.message}`);
    }
  }

  async getUserReachability(identity: string) {
    try {
      // Note: This is a placeholder for getting user reachability
      // The actual implementation may require additional Twilio configuration
      return {
        identity,
        online: false,
        not_reachable: true,
      };
    } catch (error) {
      throw new Error(`Failed to get user reachability: ${error.message}`);
    }
  }
}