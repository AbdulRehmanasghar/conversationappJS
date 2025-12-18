// Usage:
// 1) Start your Nest server: npm run start:dev
// 2) Install deps: npm install axios socket.io-client
// 3) Run: node scripts/test-send-message.js <CONVERSATION_SID> [author] [body]

const io = require("socket.io-client");
const axios = require("axios");

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3001";
const API_URL = process.env.API_URL || "http://localhost:3001/api";
const conversationSid =
  "CH81f5c9bffc154e7d8ec3f33e9e6917f2" || process.env.CONVERSATION_SID;
const author = process.argv[3] || "api_user";
const body = process.argv[4] || "Hello from API (test)";

if (!conversationSid) {
  console.error(
    "Error: conversationSid required. Usage: node scripts/test-send-message.js <CONVERSATION_SID> [author] [body]"
  );
  process.exit(1);
}

console.log("Connecting to socket at", SOCKET_URL);
const socket = io(SOCKET_URL, { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => console.log("Socket disconnected"));
socket.on("connect_error", (err) =>
  console.error("Socket connect_error", err.message)
);

socket.on("new_message", (payload) => {
  console.log("Received new_message:", JSON.stringify(payload, null, 2));
});

socket.on("message_sent", (payload) => {
  console.log("Received message_sent ack:", JSON.stringify(payload, null, 2));
});

(async function sendMessage() {
  try {
    const url = `${API_URL}/conversations/${conversationSid}/send-message`;
    console.log("Calling API:", url);
    const res = await axios.post(url, { body, author, media: [] });
    console.log("API response:", res.data);
  } catch (err) {
    if (err.response) console.error("API error response:", err.response.data);
    else console.error("API error:", err.message);
  }
})();
