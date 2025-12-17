# Chat Application - Frontend Developer Documentation

## Overview

This is a real-time chat application built with NestJS, Socket.IO, and Twilio Conversations API. It supports text messages, media uploads (images, voice, etc.), real-time messaging, typing indicators, and online user presence.

**Server Details:**

- REST API Base URL: `http://localhost:3001/api`
- WebSocket URL: `ws://localhost:3001` or `http://localhost:3001`
- API Prefix: All REST endpoints start with `/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [REST API Endpoints](#rest-api-endpoints)
3. [WebSocket Events](#websocket-events)
4. [Data Models](#data-models)
5. [Integration Guide](#integration-guide)
6. [Error Handling](#error-handling)

---

## Authentication

### Generate Access Token

Before connecting to the chat, each user needs an access token.

**Endpoint:** `POST /api/conversations/generate-token`

**Request Body:**

```json
{
  "user_id": "user123"
}
```

**Response:**

```json
{
  "status": 200,
  "message": "Token generated",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**

- The `user_id` can be any unique identifier for your user
- Token is valid for 1 hour (3600 seconds)
- Store this token securely for WebSocket authentication

---

## REST API Endpoints

### 1. Create Conversation

**Endpoint:** `POST /api/conversations/create`

**Description:** Create a new conversation (group or one-on-one)

**Request Body:**

```json
{
  "friendly_name": "Optional Custom Name",
  "participants": [
    {
      "id": "user123",
      "name": "John Doe",
      "image": "optional_base64_image_or_url"
    },
    {
      "id": "user456",
      "name": "Jane Smith",
      "image": "optional_base64_image_or_url"
    }
  ]
}
```

**Response:**

```json
{
  "status": 200,
  "message": "Conversation created successfully",
  "data": {
    "success": true,
    "conversation_sid": "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "friendly_name": "user123_John Doe_+user456_Jane Smith_",
    "participants": [...]
  }
}
```

---

### 2. Create Private Conversation (1-on-1)

**Endpoint:** `POST /api/conversations/newconversation`

**Description:** Create or retrieve an existing private conversation between users. If conversation already exists, returns existing conversation with message history.

**Request Body:**

```json
{
  "friendly_name": "Optional Custom Name",
  "participants": [
    {
      "id": "user123",
      "name": "John Doe",
      "image": "https://example.com/avatar.jpg"
    },
    {
      "id": "user456",
      "name": "Jane Smith",
      "image": "https://example.com/avatar2.jpg"
    }
  ]
}
```

**Response (New Conversation):**

```json
{
  "status": 200,
  "message": "Private conversation created successfully",
  "data": {
    "success": true,
    "conversation_sid": "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "friendly_name": "user123_John Doe_+user456_Jane Smith_",
    "participants": [...],
    "existing": false
  }
}
```

**Response (Existing Conversation):**

```json
{
  "status": 200,
  "message": "Private conversation created successfully",
  "data": {
    "success": true,
    "conversation_sid": "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "friendly_name": "user123_John Doe_+user456_Jane Smith_",
    "participants": [...],
    "existing": true,
    "messages": [
      {
        "sid": "IMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "body": "Hello!",
        "author": "user123",
        "date_created": "2025-12-17T10:30:00.000Z",
        "media": []
      }
    ]
  }
}
```

---

### 3. List All Conversations

**Endpoint:** `GET /api/conversations`

**Query Parameters:**

- `userId` (optional): Filter conversations for a specific user

**Examples:**

```
GET /api/conversations
GET /api/conversations?userId=user123
```

**Response:**

```json
{
  "status": 200,
  "message": "Conversations retrieved successfully",
  "data": [
    {
      "sid": "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "friendly_name": "user123_John Doe_+user456_Jane Smith_",
      "date_created": "2025-12-17T10:00:00.000Z",
      "date_updated": "2025-12-17T10:30:00.000Z",
      "last_message": {
        "sid": "IMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "body": "Last message text",
        "author": "user123",
        "date_created": "2025-12-17T10:30:00.000Z",
        "media": []
      }
    }
  ]
}
```

---

### 4. Get User Conversations

**Endpoint:** `GET /api/conversations/:userId/conversations`

**Description:** Get all conversations for a specific user

**Example:**

```
GET /api/conversations/user123/conversations
```

**Response:** Same as List All Conversations

---

### 5. Get Messages in a Conversation

**Endpoint:** `GET /api/conversations/:convoSid/messages`

**Description:** Retrieve message history (last 100 messages)

**Example:**

```
GET /api/conversations/CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/messages
```

**Response:**

```json
{
  "status": 200,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "sid": "IMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "body": "Hello, how are you?",
      "author": "user123",
      "date_created": "2025-12-17T10:30:00.000Z",
      "media": []
    },
    {
      "sid": "IMyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
      "body": "I'm good, thanks!",
      "author": "user456",
      "date_created": "2025-12-17T10:31:00.000Z",
      "media": ["MEzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"]
    }
  ]
}
```

---

### 6. Send Message (REST API)

**Endpoint:** `POST /api/conversations/:convoSid/send-message`

**Description:** Send a message via REST API (also broadcasts via WebSocket)

**Request Body:**

```json
{
  "body": "Hello, this is my message!",
  "author": "user123",
  "media": ["https://example.com/image.jpg", "https://example.com/audio.mp3"]
}
```

**Notes on Media:**

- `media` is optional array of URLs
- Supports images, audio, video, documents
- Media URLs should be publicly accessible

**Response:**

```json
{
  "status": 200,
  "message": "Message sent successfully",
  "data": {
    "success": true,
    "message_sid": "IMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "body": "Hello, this is my message!",
    "author": "user123",
    "date_created": "2025-12-17T10:35:00.000Z"
  }
}
```

---

### 7. Add Chat Participant

**Endpoint:** `POST /api/conversations/:convoSid/add-chat-participant`

**Description:** Add a user to an existing conversation

**Request Body:**

```json
{
  "identity": "user789"
}
```

**Response:**

```json
{
  "status": 200,
  "message": "Chat participant added successfully",
  "data": {
    "success": true,
    "participant_sid": "MBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "identity": "user789"
  }
}
```

---

### 8. Add SMS Participant

**Endpoint:** `POST /api/conversations/:convoSid/add-sms-participant`

**Description:** Add a phone number to the conversation (requires Twilio phone number)

**Request Body:**

```json
{
  "phone_number": "+1234567890"
}
```

**Response:**

```json
{
  "status": 200,
  "message": "SMS participant added successfully",
  "data": {
    "success": true,
    "participant_sid": "MBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "phone_number": "+1234567890"
  }
}
```

---

### 9. Get Media Content

**Endpoint:** `GET /api/conversations/media/:mediaSid/content`

**Description:** Get media content information

**Example:**

```
GET /api/conversations/media/MExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/content
```

**Response:**

```json
{
  "status": 200,
  "message": "Media content retrieved successfully",
  "data": {
    "content_type": "application/octet-stream",
    "size": 0,
    "url": "https://media.twiliocdn.com/MExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

---

### 10. Delete Conversation

**Endpoint:** `DELETE /api/conversations/:convoSid`

**Description:** Permanently delete a conversation

**Example:**

```
DELETE /api/conversations/CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Response:**

```json
{
  "status": 200,
  "message": "Conversation deleted successfully",
  "data": {
    "success": true,
    "message": "Conversation deleted successfully"
  }
}
```

---

### 11. Enable Reachability

**Endpoint:** `POST /api/conversations/enable-reachability`

**Description:** Enable user reachability features

**Response:**

```json
{
  "status": 200,
  "message": "Reachability enabled successfully",
  "data": {
    "success": true,
    "message": "Reachability feature configured"
  }
}
```

---

### 12. Get User Reachability

**Endpoint:** `GET /api/conversations/users/:identity/reachability`

**Description:** Check if a user is reachable

**Example:**

```
GET /api/conversations/users/user123/reachability
```

**Response:**

```json
{
  "status": 200,
  "message": "User reachability retrieved successfully",
  "data": {
    "identity": "user123",
    "online": false,
    "not_reachable": true
  }
}
```

---

## WebSocket Events

### Connection Setup

**Connect to WebSocket:**

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

---

### Client → Server Events

#### 1. user_connect

**Description:** Authenticate and register user with the WebSocket server

**Emit:**

```javascript
socket.emit("user_connect", {
  userId: "user123",
  identity: "user123", // or 'john.doe@example.com'
});
```

**Response:** `user_connected` event

---

#### 2. join_conversation

**Description:** Join a conversation room to receive messages

**Emit:**

```javascript
socket.emit("join_conversation", {
  conversationSid: "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  identity: "user123",
});
```

**Response:** `joined_conversation` event

---

#### 3. leave_conversation

**Description:** Leave a conversation room

**Emit:**

```javascript
socket.emit("leave_conversation", {
  conversationSid: "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  identity: "user123",
});
```

**No direct response** - Other users will receive `user_left` event

---

#### 4. send_message

**Description:** Send a message via WebSocket (real-time)

**Emit:**

```javascript
socket.emit("send_message", {
  conversationSid: "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  body: "Hello everyone!",
  author: "user123",
  media: [
    "https://example.com/image.jpg", // Image URL
    "https://example.com/voice.mp3", // Voice recording URL
  ],
});
```

**Response:** `message_sent` event (confirmation)
**Broadcast:** All users in the conversation receive `new_message` event

---

#### 5. typing_start

**Description:** Notify others that user is typing

**Emit:**

```javascript
socket.emit("typing_start", {
  conversationSid: "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  identity: "user123",
});
```

**Broadcast:** Other users receive `user_typing` event with `isTyping: true`

---

#### 6. typing_stop

**Description:** Notify others that user stopped typing

**Emit:**

```javascript
socket.emit("typing_stop", {
  conversationSid: "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  identity: "user123",
});
```

**Broadcast:** Other users receive `user_typing` event with `isTyping: false`

---

#### 7. get_online_users

**Description:** Get list of users currently in a conversation

**Emit:**

```javascript
socket.emit("get_online_users", {
  conversationSid: "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
});
```

**Response:** `online_users` event

---

#### 8. ping

**Description:** Health check / keep-alive

**Emit:**

```javascript
socket.emit("ping");
```

**Response:** `pong` event

---

### Server → Client Events

#### 1. user_connected

**Description:** Confirmation that user successfully connected

**Listen:**

```javascript
socket.on("user_connected", (data) => {
  console.log("Connected:", data);
  // data = {
  //   success: true,
  //   message: 'Connected to chat server',
  //   userId: 'user123',
  //   identity: 'user123'
  // }
});
```

---

#### 2. joined_conversation

**Description:** Confirmation that you joined a conversation

**Listen:**

```javascript
socket.on("joined_conversation", (data) => {
  console.log("Joined conversation:", data);
  // data = {
  //   success: true,
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   message: 'Joined conversation CHxxxxx...'
  // }
});
```

---

#### 3. conversation_users

**Description:** List of users currently in the conversation

**Listen:**

```javascript
socket.on("conversation_users", (data) => {
  console.log("Online users:", data.onlineUsers);
  // data = {
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   onlineUsers: [
  //     {
  //       userId: 'user123',
  //       identity: 'user123',
  //       lastSeen: '2025-12-17T10:30:00.000Z'
  //     }
  //   ]
  // }
});
```

---

#### 4. user_joined

**Description:** Another user joined the conversation

**Listen:**

```javascript
socket.on("user_joined", (data) => {
  console.log(`${data.identity} joined the conversation`);
  // data = {
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   identity: 'user456',
  //   timestamp: '2025-12-17T10:35:00.000Z'
  // }
});
```

---

#### 5. user_left

**Description:** Another user left the conversation

**Listen:**

```javascript
socket.on("user_left", (data) => {
  console.log(`${data.identity} left the conversation`);
  // data = {
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   identity: 'user456',
  //   timestamp: '2025-12-17T10:40:00.000Z'
  // }
});
```

---

#### 6. new_message

**Description:** New message received in the conversation

**Listen:**

```javascript
socket.on("new_message", (data) => {
  console.log("New message:", data.message);
  // data = {
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   message: {
  //     sid: 'IMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //     body: 'Hello everyone!',
  //     author: 'user123',
  //     dateCreated: '2025-12-17T10:45:00.000Z',
  //     media: ['https://example.com/image.jpg']
  //   },
  //   timestamp: '2025-12-17T10:45:00.000Z'
  // }
});
```

---

#### 7. message_sent

**Description:** Confirmation that your message was sent successfully

**Listen:**

```javascript
socket.on("message_sent", (data) => {
  console.log("Message sent successfully:", data.messageSid);
  // data = {
  //   success: true,
  //   messageSid: 'IMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  // }
});
```

---

#### 8. message_error

**Description:** Error occurred while sending message

**Listen:**

```javascript
socket.on("message_error", (data) => {
  console.error("Message error:", data.error);
  // data = {
  //   success: false,
  //   error: 'Error message description',
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  // }
});
```

---

#### 9. user_typing

**Description:** Another user is typing or stopped typing

**Listen:**

```javascript
socket.on("user_typing", (data) => {
  if (data.isTyping) {
    console.log(`${data.identity} is typing...`);
  } else {
    console.log(`${data.identity} stopped typing`);
  }
  // data = {
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   identity: 'user456',
  //   isTyping: true,
  //   timestamp: '2025-12-17T10:50:00.000Z'
  // }
});
```

---

#### 10. online_users

**Description:** Response with list of online users

**Listen:**

```javascript
socket.on("online_users", (data) => {
  console.log("Online users:", data.users);
  // data = {
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   users: [
  //     {
  //       userId: 'user123',
  //       identity: 'user123',
  //       lastSeen: '2025-12-17T10:30:00.000Z'
  //     }
  //   ]
  // }
});
```

---

#### 11. conversation_updated

**Description:** Conversation metadata was updated

**Listen:**

```javascript
socket.on("conversation_updated", (data) => {
  console.log("Conversation updated:", data.update);
  // data = {
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   update: { /* update details */ },
  //   timestamp: '2025-12-17T10:55:00.000Z'
  // }
});
```

---

#### 12. user_status_changed

**Description:** User's status changed (online/offline/away/etc.)

**Listen:**

```javascript
socket.on("user_status_changed", (data) => {
  console.log(`${data.identity} status changed:`, data.status);
  // data = {
  //   conversationSid: 'CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  //   userId: 'user123',
  //   identity: 'user123',
  //   status: { /* status object */ },
  //   timestamp: '2025-12-17T11:00:00.000Z'
  // }
});
```

---

#### 13. pong

**Description:** Response to ping (health check)

**Listen:**

```javascript
socket.on("pong", (data) => {
  console.log("Pong received:", data.timestamp);
  // data = {
  //   timestamp: '2025-12-17T11:05:00.000Z'
  // }
});
```

---

#### 14. disconnect

**Description:** Socket disconnected

**Listen:**

```javascript
socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
  // reason can be:
  // - 'transport close'
  // - 'ping timeout'
  // - 'client namespace disconnect'
  // etc.
});
```

---

#### 15. connect_error

**Description:** Connection error occurred

**Listen:**

```javascript
socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});
```

---

## Data Models

### Participant Object

```typescript
{
  id: string;          // User unique identifier
  name: string;        // User display name
  image?: string;      // Optional profile image (URL or base64)
}
```

### Message Object

```typescript
{
  sid: string;              // Message SID (Twilio identifier)
  body: string;             // Message text content
  author: string;           // Author user ID/identity
  date_created: string;     // ISO 8601 timestamp
  dateCreated: string;      // Alternative format
  media: string[];          // Array of media URLs or SIDs
}
```

### Conversation Object

```typescript
{
  sid: string; // Conversation SID
  friendly_name: string; // Conversation display name
  date_created: string; // ISO 8601 timestamp
  date_updated: string; // ISO 8601 timestamp
  last_message: Message | null; // Last message or null
}
```

### User Object (WebSocket)

```typescript
{
  userId: string; // User unique identifier
  identity: string; // User identity (can be email or ID)
  lastSeen: Date; // Last activity timestamp
}
```

---

## Integration Guide

### Complete Example: React/Next.js

```javascript
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function ChatComponent({ userId, conversationSid }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // 1. Initialize Socket.IO connection
    const newSocket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket");

      // 2. Authenticate user
      newSocket.emit("user_connect", {
        userId: userId,
        identity: userId,
      });
    });

    // 3. Listen for user connected confirmation
    newSocket.on("user_connected", (data) => {
      console.log("✅ User authenticated:", data);

      // 4. Join conversation room
      newSocket.emit("join_conversation", {
        conversationSid: conversationSid,
        identity: userId,
      });
    });

    // 5. Listen for joined conversation confirmation
    newSocket.on("joined_conversation", (data) => {
      console.log("✅ Joined conversation:", data);
    });

    // 6. Listen for online users list
    newSocket.on("conversation_users", (data) => {
      setOnlineUsers(data.onlineUsers);
    });

    // 7. Listen for new messages
    newSocket.on("new_message", (data) => {
      setMessages((prev) => [...prev, data.message]);

      // Play notification sound if message is from another user
      if (data.message.author !== userId) {
        playNotificationSound();
      }
    });

    // 8. Listen for typing indicators
    newSocket.on("user_typing", (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => [...prev, data.identity]);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== data.identity));
      }
    });

    // 9. Listen for user joined
    newSocket.on("user_joined", (data) => {
      console.log(`${data.identity} joined`);
      // Update UI to show user joined
    });

    // 10. Listen for user left
    newSocket.on("user_left", (data) => {
      console.log(`${data.identity} left`);
      // Update UI to show user left
    });

    // 11. Handle errors
    newSocket.on("message_error", (data) => {
      console.error("Message error:", data.error);
      alert("Failed to send message: " + data.error);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.emit("leave_conversation", {
        conversationSid: conversationSid,
        identity: userId,
      });
      newSocket.disconnect();
    };
  }, [userId, conversationSid]);

  // Load message history
  useEffect(() => {
    fetch(`http://localhost:3001/api/conversations/${conversationSid}/messages`)
      .then((res) => res.json())
      .then((result) => {
        if (result.status === 200) {
          setMessages(result.data);
        }
      })
      .catch((err) => console.error("Failed to load messages:", err));
  }, [conversationSid]);

  // Send message function
  const sendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    socket.emit("send_message", {
      conversationSid: conversationSid,
      body: messageInput,
      author: userId,
      media: [], // Add media URLs if needed
    });

    setMessageInput("");

    // Stop typing indicator
    socket.emit("typing_stop", {
      conversationSid: conversationSid,
      identity: userId,
    });
    setIsTyping(false);
  };

  // Handle typing
  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!isTyping && e.target.value) {
      socket.emit("typing_start", {
        conversationSid: conversationSid,
        identity: userId,
      });
      setIsTyping(true);
    }

    // Auto-stop typing after 3 seconds of inactivity
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit("typing_stop", {
        conversationSid: conversationSid,
        identity: userId,
      });
      setIsTyping(false);
    }, 3000);
  };

  // Upload and send image
  const sendImageMessage = async (file) => {
    // Upload image to your server or cloud storage
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("YOUR_UPLOAD_ENDPOINT", {
      method: "POST",
      body: formData,
    });

    const { url } = await uploadResponse.json();

    // Send message with image
    socket.emit("send_message", {
      conversationSid: conversationSid,
      body: "Sent an image",
      author: userId,
      media: [url],
    });
  };

  // Upload and send voice recording
  const sendVoiceMessage = async (audioBlob) => {
    // Upload audio to your server or cloud storage
    const formData = new FormData();
    formData.append("file", audioBlob, "voice.mp3");

    const uploadResponse = await fetch("YOUR_UPLOAD_ENDPOINT", {
      method: "POST",
      body: formData,
    });

    const { url } = await uploadResponse.json();

    // Send message with voice
    socket.emit("send_message", {
      conversationSid: conversationSid,
      body: "Sent a voice message",
      author: userId,
      media: [url],
    });
  };

  return (
    <div className="chat-container">
      {/* Online users */}
      <div className="online-users">
        <h3>Online Users ({onlineUsers.length})</h3>
        {onlineUsers.map((user) => (
          <div key={user.userId}>{user.identity}</div>
        ))}
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.sid}
            className={msg.author === userId ? "my-message" : "their-message"}
          >
            <strong>{msg.author}:</strong> {msg.body}
            {/* Display media if present */}
            {msg.media && msg.media.length > 0 && (
              <div className="media-attachments">
                {msg.media.map((mediaUrl, idx) => (
                  <img
                    key={idx}
                    src={mediaUrl}
                    alt="attachment"
                    style={{ maxWidth: "200px" }}
                  />
                ))}
              </div>
            )}
            <small>{new Date(msg.date_created).toLocaleTimeString()}</small>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
            typing...
          </div>
        )}
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={messageInput}
          onChange={handleTyping}
          placeholder="Type a message..."
        />

        {/* Image upload button */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => sendImageMessage(e.target.files[0])}
          style={{ display: "none" }}
          id="image-upload"
        />
        <label htmlFor="image-upload">📷</label>

        {/* Voice recording button (implement audio recording) */}
        <button type="button" onClick={() => startVoiceRecording()}>
          🎤
        </button>

        <button type="submit">Send</button>
      </form>
    </div>
  );
}

function playNotificationSound() {
  const audio = new Audio("/notification.mp3");
  audio.play();
}

export default ChatComponent;
```

---

### Media Upload Implementation

#### 1. Image Upload Example

```javascript
const uploadImage = async (file) => {
  // Option 1: Upload to your own server
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://localhost:3001/api/upload/image", {
    method: "POST",
    body: formData,
  });

  const { url } = await response.json();
  return url;
};

// Usage
const handleImageSelect = async (e) => {
  const file = e.target.files[0];
  const imageUrl = await uploadImage(file);

  socket.emit("send_message", {
    conversationSid: conversationSid,
    body: "📷 Image",
    author: userId,
    media: [imageUrl],
  });
};
```

#### 2. Voice Recording Example

```javascript
let mediaRecorder;
let audioChunks = [];

const startVoiceRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
    audioChunks = [];

    // Upload audio
    const audioUrl = await uploadAudio(audioBlob);

    // Send message with audio
    socket.emit("send_message", {
      conversationSid: conversationSid,
      body: "🎤 Voice message",
      author: userId,
      media: [audioUrl],
    });

    // Stop recording stream
    stream.getTracks().forEach((track) => track.stop());
  };

  mediaRecorder.start();
};

const stopVoiceRecording = () => {
  mediaRecorder.stop();
};

const uploadAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice.mp3");

  const response = await fetch("http://localhost:3001/api/upload/audio", {
    method: "POST",
    body: formData,
  });

  const { url } = await response.json();
  return url;
};
```

---

### Create Conversation Example

```javascript
const createNewConversation = async (participantIds) => {
  // Step 1: Create conversation
  const response = await fetch(
    "http://localhost:3001/api/conversations/create",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participants: participantIds.map((id) => ({
          id: id,
          name: getUserName(id), // Your function to get user name
          image: getUserImage(id), // Your function to get user image
        })),
      }),
    }
  );

  const result = await response.json();
  const conversationSid = result.data.conversation_sid;

  // Step 2: Join the conversation via WebSocket
  socket.emit("join_conversation", {
    conversationSid: conversationSid,
    identity: userId,
  });

  return conversationSid;
};
```

---

## Error Handling

### Common HTTP Error Responses

All API endpoints may return these error formats:

```json
{
  "status": 500,
  "message": "Error description here"
}
```

**Common Status Codes:**

- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

### WebSocket Error Handling

```javascript
// Connection errors
socket.on("connect_error", (error) => {
  console.error("Connection failed:", error.message);
  // Implement retry logic or show error to user
});

// Message sending errors
socket.on("message_error", (data) => {
  console.error("Message failed:", data.error);
  alert("Failed to send message: " + data.error);
});

// Reconnection handling
socket.on("reconnect", (attemptNumber) => {
  console.log("Reconnected after", attemptNumber, "attempts");
  // Re-authenticate and rejoin conversations
  socket.emit("user_connect", { userId, identity: userId });
});

socket.on("reconnect_failed", () => {
  console.error("Failed to reconnect");
  // Show offline message to user
});
```

---

## Best Practices

### 1. Connection Management

- Always disconnect properly when component unmounts
- Implement reconnection logic
- Handle network interruptions gracefully

### 2. Message Optimization

- Batch message loads when possible
- Implement pagination for message history
- Cache messages locally

### 3. Typing Indicators

- Clear typing timeout after 3-5 seconds
- Stop typing indicator when message is sent
- Don't spam typing events (throttle them)

### 4. Media Handling

- Compress images before uploading
- Show upload progress to users
- Validate file types and sizes
- Use CDN for media storage

### 5. User Experience

- Show message delivery status (sending, sent, failed)
- Display timestamps
- Show read receipts if implemented
- Implement optimistic UI updates
- Show connection status indicator

### 6. Performance

- Limit message history to last 100-500 messages
- Lazy load older messages
- Debounce typing events
- Use message virtualization for long conversations

---

## Testing

### Test WebSocket Connection

```javascript
const testConnection = () => {
  const socket = io("http://localhost:3001");

  socket.on("connect", () => {
    console.log("✅ Connected!");

    socket.emit("user_connect", {
      userId: "test-user",
      identity: "test-user",
    });
  });

  socket.on("user_connected", (data) => {
    console.log("✅ Authenticated:", data);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection failed:", error);
  });
};
```

### Test REST API

```javascript
const testAPI = async () => {
  // Generate token
  const tokenResponse = await fetch(
    "http://localhost:3001/api/conversations/generate-token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "test-user" }),
    }
  );
  const tokenData = await tokenResponse.json();
  console.log("Token:", tokenData.token);

  // Create conversation
  const convoResponse = await fetch(
    "http://localhost:3001/api/conversations/create",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participants: [
          { id: "user1", name: "User One" },
          { id: "user2", name: "User Two" },
        ],
      }),
    }
  );
  const convoData = await convoResponse.json();
  console.log("Conversation:", convoData);
};
```

---

## Support & Questions

For any questions or issues:

1. Check the server console for detailed error logs
2. Verify WebSocket connection status
3. Ensure all required environment variables are set
4. Check Twilio account configuration

---

## Appendix: Quick Reference

### Socket.IO Events Summary

| Event                 | Direction       | Purpose                   |
| --------------------- | --------------- | ------------------------- |
| `user_connect`        | Client → Server | Authenticate user         |
| `user_connected`      | Server → Client | Authentication confirmed  |
| `join_conversation`   | Client → Server | Join conversation room    |
| `joined_conversation` | Server → Client | Join confirmed            |
| `leave_conversation`  | Client → Server | Leave conversation        |
| `send_message`        | Client → Server | Send message              |
| `new_message`         | Server → Client | Receive message           |
| `message_sent`        | Server → Client | Message sent confirmation |
| `message_error`       | Server → Client | Message send failed       |
| `typing_start`        | Client → Server | Start typing              |
| `typing_stop`         | Client → Server | Stop typing               |
| `user_typing`         | Server → Client | User typing status        |
| `get_online_users`    | Client → Server | Request online users      |
| `online_users`        | Server → Client | Online users list         |
| `conversation_users`  | Server → Client | Users in conversation     |
| `user_joined`         | Server → Client | User joined notification  |
| `user_left`           | Server → Client | User left notification    |
| `ping`                | Client → Server | Health check              |
| `pong`                | Server → Client | Health check response     |

### REST API Endpoints Summary

| Method | Endpoint                                            | Purpose                     |
| ------ | --------------------------------------------------- | --------------------------- |
| POST   | `/api/conversations/generate-token`                 | Generate auth token         |
| POST   | `/api/conversations/create`                         | Create conversation         |
| POST   | `/api/conversations/newconversation`                | Create private conversation |
| GET    | `/api/conversations`                                | List conversations          |
| GET    | `/api/conversations/:userId/conversations`          | User conversations          |
| GET    | `/api/conversations/:convoSid/messages`             | Get messages                |
| POST   | `/api/conversations/:convoSid/send-message`         | Send message                |
| POST   | `/api/conversations/:convoSid/add-chat-participant` | Add participant             |
| POST   | `/api/conversations/:convoSid/add-sms-participant`  | Add SMS participant         |
| GET    | `/api/conversations/media/:mediaSid/content`        | Get media                   |
| DELETE | `/api/conversations/:convoSid`                      | Delete conversation         |

---

**Last Updated:** December 17, 2025  
**API Version:** 1.0.0  
**Server:** NestJS + Socket.IO + Twilio Conversations
