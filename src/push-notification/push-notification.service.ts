import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";

@Injectable()
export class PushNotificationService {
  private firebaseEnabled = false;
  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const firebaseCredentialsPath = this.configService.get<string>(
      "FIREBASE_CREDENTIALS"
    );

    // If no credentials provided, skip initialization (safe to ignore Firebase)
    if (!firebaseCredentialsPath) {
      console.log(
        "⚠️ Firebase credentials not set; skipping Firebase initialization"
      );
      this.firebaseEnabled = false;
      return;
    }

    try {
      if (!admin.apps.length) {
        const serviceAccount = require(`../../${firebaseCredentialsPath}`);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.firebaseEnabled = true;
        console.log("✅ Firebase initialized");
      } else {
        this.firebaseEnabled = true;
      }
    } catch (err: any) {
      this.firebaseEnabled = false;
      console.warn(
        "⚠️ Failed to initialize Firebase:",
        err && err.message ? err.message : err
      );
    }
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    try {
      if (!this.firebaseEnabled) {
        return {
          success: false,
          message: "Firebase not configured",
          user_id: userId,
        };
      }
      // In a real application, you would fetch the FCM token from database
      // For now, we'll assume the userId contains the FCM token or fetch from a service
      const fcmToken = await this.getFcmTokenByUserId(userId);

      if (!fcmToken) {
        throw new Error("FCM token not found for user");
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        message_id: response,
        user_id: userId,
      };
    } catch (error) {
      throw new Error(`Failed to send push notification: ${error.message}`);
    }
  }

  async sendGroupPushNotification(
    groupId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    try {
      if (!this.firebaseEnabled) {
        return {
          success: false,
          message: "Firebase not configured",
          group_id: groupId,
        };
      }
      // Get all FCM tokens for group members
      const fcmTokens = await this.getFcmTokensByGroupId(groupId);

      if (!fcmTokens || fcmTokens.length === 0) {
        throw new Error("No FCM tokens found for group members");
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: {
          group_id: groupId,
          ...data,
        },
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendMulticast(message);

      return {
        success: true,
        success_count: response.successCount,
        failure_count: response.failureCount,
        group_id: groupId,
        responses: response.responses,
      };
    } catch (error) {
      throw new Error(
        `Failed to send group push notification: ${error.message}`
      );
    }
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    try {
      if (!this.firebaseEnabled) {
        return { success: false, message: "Firebase not configured", topic };
      }
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        topic,
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        message_id: response,
        topic,
      };
    } catch (error) {
      throw new Error(`Failed to send topic notification: ${error.message}`);
    }
  }

  async subscribeToTopic(fcmToken: string, topic: string) {
    try {
      if (!this.firebaseEnabled) {
        return { success: false, message: "Firebase not configured" };
      }
      const response = await admin
        .messaging()
        .subscribeToTopic([fcmToken], topic);

      return {
        success: true,
        success_count: response.successCount,
        failure_count: response.failureCount,
      };
    } catch (error) {
      throw new Error(`Failed to subscribe to topic: ${error.message}`);
    }
  }

  async unsubscribeFromTopic(fcmToken: string, topic: string) {
    try {
      if (!this.firebaseEnabled) {
        return { success: false, message: "Firebase not configured" };
      }
      const response = await admin
        .messaging()
        .unsubscribeFromTopic([fcmToken], topic);

      return {
        success: true,
        success_count: response.successCount,
        failure_count: response.failureCount,
      };
    } catch (error) {
      throw new Error(`Failed to unsubscribe from topic: ${error.message}`);
    }
  }

  private async getFcmTokenByUserId(userId: string): Promise<string | null> {
    // This should be implemented to fetch from your database
    // For now, returning null - you'll need to implement this based on your user FCM token storage
    return null;
  }

  private async getFcmTokensByGroupId(groupId: string): Promise<string[]> {
    // This should be implemented to fetch all FCM tokens for group members
    // For now, returning empty array - you'll need to implement this based on your group member storage
    return [];
  }
}
