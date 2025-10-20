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

// Socket.IO event names
export const SOCKET_EVENTS = {
  // Connection events
  USER_CONNECT: 'user_connect',
  USER_CONNECTED: 'user_connected',
  USER_DISCONNECT: 'disconnect',
  
  // Conversation events
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  JOINED_CONVERSATION: 'joined_conversation',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  
  // Message events
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_ERROR: 'message_error',
  
  // Typing events
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',
  
  // Status events
  GET_ONLINE_USERS: 'get_online_users',
  ONLINE_USERS: 'online_users',
  CONVERSATION_USERS: 'conversation_users',
  USER_STATUS_CHANGED: 'user_status_changed',
  CONVERSATION_UPDATED: 'conversation_updated',
  
  // Health check
  PING: 'ping',
  PONG: 'pong',
} as const;