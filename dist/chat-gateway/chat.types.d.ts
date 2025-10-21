export interface ChatUser {
    userId: string;
    identity: string;
    socketId: string;
    conversationSids: string[];
    lastSeen: Date;
}
export interface MessageData {
    conversationSid: string;
    body: string;
    author: string;
    media?: string[];
}
export interface TypingIndicator {
    conversationSid: string;
    identity: string;
    isTyping: boolean;
}
export interface ConversationEvent {
    conversationSid: string;
    identity: string;
    timestamp: Date;
}
export interface OnlineUser {
    userId: string;
    identity: string;
    lastSeen: Date;
}
export interface ChatMessage {
    sid: string;
    body: string;
    author: string;
    dateCreated: string;
    media?: string[];
}
export interface SocketResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: any;
}
export declare const SOCKET_EVENTS: {
    readonly USER_CONNECT: "user_connect";
    readonly USER_CONNECTED: "user_connected";
    readonly USER_DISCONNECT: "disconnect";
    readonly JOIN_CONVERSATION: "join_conversation";
    readonly LEAVE_CONVERSATION: "leave_conversation";
    readonly JOINED_CONVERSATION: "joined_conversation";
    readonly USER_JOINED: "user_joined";
    readonly USER_LEFT: "user_left";
    readonly SEND_MESSAGE: "send_message";
    readonly NEW_MESSAGE: "new_message";
    readonly MESSAGE_SENT: "message_sent";
    readonly MESSAGE_ERROR: "message_error";
    readonly TYPING_START: "typing_start";
    readonly TYPING_STOP: "typing_stop";
    readonly USER_TYPING: "user_typing";
    readonly GET_ONLINE_USERS: "get_online_users";
    readonly ONLINE_USERS: "online_users";
    readonly CONVERSATION_USERS: "conversation_users";
    readonly USER_STATUS_CHANGED: "user_status_changed";
    readonly CONVERSATION_UPDATED: "conversation_updated";
    readonly PING: "ping";
    readonly PONG: "pong";
};
