import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../twilio/twilio.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ConversationService {
  private chatGateway: any; // Will be injected later to avoid circular dependency

  constructor(
    private twilioService: TwilioService,
    private configService: ConfigService,
  ) {}

  // Inject ChatGateway after module initialization to avoid circular dependency
  setChatGateway(chatGateway: any) {
    this.chatGateway = chatGateway;
  }

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

  async createConversation(friendlyName?: string, participants?: any[]) {
    try {
      // Generate friendly name from participants if not provided
      let conversationName = friendlyName;
      
      if (!conversationName && participants && participants.length > 0) {
        // Check if participants are in new format (objects with id, name, image)
        if (typeof participants[0] === 'object' && participants[0].id) {
          // New format: concatenate id_name_image for each participant
          conversationName = participants
            .map(p => `${p.id}_${p.name}_${p.image || ''}`)
            .join('+');
        } else {
          // Old format: just join participant strings
          conversationName = participants.join('_');
        }
      }

      const conversation = await this.twilioService
        .getClient()
        .conversations.v1.conversations.create({
          friendlyName: conversationName,
        });

      if (participants && participants.length > 0) {
        for (const participant of participants) {
          // Handle both old format (string) and new format (object)
          const participantId = typeof participant === 'object' ? participant.id : participant;
          await this.addChatParticipant(conversation.sid, participantId);
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

  async createPrivateConversation(friendlyName?: string, participants?: any[]) {
    // Support both call patterns:
    // 1) createPrivateConversation(friendlyName, participants)
    // 2) createPrivateConversation(participants)  (when caller passes array as first arg)
    if (!participants && Array.isArray(friendlyName)) {
      participants = friendlyName as any[];
      friendlyName = undefined;
    }

    participants = participants || [];

    // Determine identities for uniqueName (support object or string participants)
    const identities = participants.map((p) => (typeof p === 'object' && p.id ? p.id : p));

    // Build uniqueName for a private conversation (sort to keep consistent)
    const uniqueName = [...identities].sort().join('_');

    try {
      // Generate friendly name from participants similar to createConversation
      let conversationName: string | undefined = friendlyName;

      if (!conversationName && participants && participants.length > 0) {
        // Check if participants are in new format (objects with id, name, image)
        if (typeof participants[0] === 'object' && participants[0].id) {
          // New format: concatenate id_name_image for each participant
          conversationName = participants
            .map((p: any) => `${p.id}_${p.name}_${p.image || ''}`)
            .join('+');
        } else {
          // Old format: just join participant strings
          conversationName = identities.join('_');
        }
      }

      // Check if conversation already exists (use uniqueName when possible)
      const client = this.twilioService.getClient();
      const conversations = await client.conversations.v1.conversations.list({ limit: 1000 });

      const existingConvo = uniqueName ? conversations.find((c) => c.uniqueName === uniqueName) : undefined;

      if (existingConvo) {
        return {
          success: true,
          conversation_sid: existingConvo.sid,
          friendly_name: existingConvo.friendlyName,
          participants: participants,
          existing: true,
        };
      }

      // Create new conversation
      const conversation = await client.conversations.v1.conversations.create({
        friendlyName: conversationName || (identities.length >= 2 ? `Private: ${identities[0]} & ${identities[1]}` : 'Private Conversation'),
        uniqueName: uniqueName || undefined,
      });

      // Add participants (use identities)
      for (const id of identities) {
        try {
          await this.addChatParticipant(conversation.sid, id);
        } catch (err) {
          // Continue adding other participants even if one fails
        }
      }

      return {
        success: true,
        conversation_sid: conversation.sid,
        friendly_name: conversation.friendlyName,
        participants: participants,
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

      const result = {
        success: true,
        message_sid: message.sid,
        body: message.body,
        author: message.author,
        date_created: message.dateCreated,
      };

      // Broadcast via Socket.IO if ChatGateway is available
      if (this.chatGateway) {
        this.chatGateway.broadcastMessage(conversationSid, {
          sid: message.sid,
          body: message.body,
          author: message.author,
          dateCreated: message.dateCreated,
          media: media || [],
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async listConversations(userId?: string) {
    try {
      const client = this.twilioService.getClient();
      
      const conversations = await client.conversations.v1.conversations.list({ limit: 1000 });

      // Parallelize fetching last message (and participants when userId filter is used)
      const convoPromises = conversations.map(async (conversation) => {
        const convoSid = conversation.sid;

        const messagesP = client.conversations.v1.conversations(convoSid).messages.list({ limit: 1 });
        const participantsP = userId ? client.conversations.v1.conversations(convoSid).participants.list() : Promise.resolve([]);

        const [messagesRes, participantsRes] = await Promise.allSettled([messagesP, participantsP]);

        const last = messagesRes.status === 'fulfilled' && messagesRes.value && messagesRes.value.length > 0 ? messagesRes.value[0] : null;
        const participants = participantsRes.status === 'fulfilled' ? participantsRes.value : [];

        const hasUser = userId ? participants.some((p) => p.identity === userId) : true;

        if (!hasUser) return null;

        return {
          sid: convoSid,
          friendly_name: conversation.friendlyName,
          date_created: conversation.dateCreated,
          date_updated: conversation.dateUpdated,
          last_message: last
            ? {
                sid: last.sid,
                body: last.body,
                author: last.author,
                date_created: last.dateCreated,
                media: last.media || [],
              }
            : null,
        };
      });

      const settled = await Promise.allSettled(convoPromises);
      const result = settled
        .filter((s) => s.status === 'fulfilled')
        .map((s: any) => s.value)
        .filter(Boolean);

      return result;
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