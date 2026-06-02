import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { Message, Chat } from "./models/message.js";
import User from "./models/user.js";
import redisClient, { redisAvailable } from "./config/redis.js";
import { wsMetrics } from "./routes/securityRoutes.js";
import { scanAndUnlink } from "./utils/redisHelpers.js";
import { isAllowedImageUrl, INVALID_IMAGE_URL_MESSAGE } from "./utils/isAllowedImageUrl.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const rawOrigins = process.env.ALLOWED_ORIGINS || "";
      const allowedOrigins = rawOrigins.split(",").map(o => o.trim()).filter(Boolean);
      if (allowedOrigins.length === 0) {
        allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000");
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: WS Origin '${origin}' is not allowed`));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Store io reference globally for metrics retrieval
global.io = io;

// IP parsing helper
const getClientIp = (socket) => {
  const headers = socket.handshake.headers || {};
  return headers["cf-connecting-ip"] ||
         headers["x-real-ip"] ||
         (headers["x-forwarded-for"] ? headers["x-forwarded-for"].split(",")[0].trim() : null) ||
         socket.handshake.address ||
         "127.0.0.1";
};

// Lua script to atomically check and set connection counts per IP and User
const ATOMIC_CONNECTION_LIMIT_LUA = `
  local ip_key = KEYS[1]
  local user_key = KEYS[2]
  local socket_id = ARGV[1]
  local max_ip = tonumber(ARGV[2])
  local max_user = tonumber(ARGV[3])
  local ttl = tonumber(ARGV[4])

  local ip_count = redis.call('SCARD', ip_key)
  if ip_count >= max_ip then
    return -1
  end

  local user_count = redis.call('SCARD', user_key)
  if user_count >= max_user then
    return -2
  end

  redis.call('SADD', ip_key, socket_id)
  redis.call('EXPIRE', ip_key, ttl)
  redis.call('SADD', user_key, socket_id)
  redis.call('EXPIRE', user_key, ttl)
  return 1
`;

// JWT handshake authenticator and connection limiter middleware
io.use(async (socket, next) => {
  const ip = getClientIp(socket);
  socket.ip = ip;

  const token = socket.handshake.auth?.token;
  if (!token) {
    console.warn(`[SECURITY ALERT] Connection rejected: No token from IP: ${ip}`);
    return next(new Error("Authentication failed: Token required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return next(new Error("Authentication failed: Invalid token payload"));
    }
    socket.userId = decoded.id;

    // Check Redis connection limits if Redis is available
    if (redisAvailable) {
      const ipKey = `ws:conn:ip:${ip}`;
      const userKey = `ws:conn:user:${decoded.id}`;
      
      const result = await redisClient.eval(ATOMIC_CONNECTION_LIMIT_LUA, {
        keys: [ipKey, userKey],
        arguments: [socket.id, "10", "3", "86400"]
      });

      if (result === -1) {
        wsMetrics.abuseIncidents++;
        console.warn(`[SECURITY ALERT] Connection rejected: Max connections (10) reached for IP: ${ip}`);
        return next(new Error("IP connection limit exceeded"));
      } else if (result === -2) {
        wsMetrics.abuseIncidents++;
        console.warn(`[SECURITY ALERT] Connection rejected: Max connections (3) reached for User: ${decoded.id}`);
        return next(new Error("User connection limit exceeded"));
      }
    }

    wsMetrics.activeConnections++;
    next();
  } catch (error) {
    console.warn(`[SECURITY ALERT] Connection rejected: Invalid token from IP: ${ip}`);
    return next(new Error("Authentication failed: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`Securely connected: ${socket.id} (User: ${socket.userId})`);

  // Ring buffer for socket event rate limiting (120 msgs/min)
  const MAX_TIMESTAMPS = 120;
  const timestampBuffer = new Array(MAX_TIMESTAMPS).fill(0);
  let tsHead = 0;

  const recordTimestamp = (now) => {
    timestampBuffer[tsHead] = now;
    tsHead = (tsHead + 1) % MAX_TIMESTAMPS;
  };

  const countRecentTimestamps = (now, windowMs) => {
    let count = 0;
    for (let i = 0; i < MAX_TIMESTAMPS; i++) {
      if (timestampBuffer[i] > 0 && now - timestampBuffer[i] < windowMs) {
        count++;
      }
    }
    return count;
  };

  // Packet level filter middleware
  socket.use(([event, ...args], next) => {
    const now = Date.now();

    // 1. Packet size limit (Max 2048 bytes)
    const payloadStr = JSON.stringify(args);
    const byteSize = Buffer.byteLength(payloadStr, "utf8");
    if (byteSize > 2048) {
      wsMetrics.abuseIncidents++;
      console.warn(`[SECURITY ALERT] Packet size (2KB) exceeded: ${byteSize} bytes from Socket: ${socket.id}`);
      socket.emit("message_error", { error: "Payload size limit exceeded" });
      socket.disconnect(true);
      return;
    }

    // 2. Rate limit (120 messages per minute)
    const recentCount = countRecentTimestamps(now, 60000);
    if (recentCount >= MAX_TIMESTAMPS) {
      wsMetrics.abuseIncidents++;
      console.warn(`[SECURITY ALERT] Event rate limit (120/min) exceeded by Socket: ${socket.id}`);
      socket.emit("message_error", { error: "Rate limit exceeded" });
      socket.disconnect(true);
      return;
    }

    recordTimestamp(now);
    next();
  });

  // User online status update (uses verified socket.userId)
  socket.on("user_online", async () => {
    if (!socket.userId) return;
    try {
      await User.findByIdAndUpdate(socket.userId, { isOnline: true });
      socket.broadcast.emit("user_status_change", { userId: socket.userId, isOnline: true });
    } catch (err) {
      console.error(err);
    }
  });

  // Join chat (validates chatId and user membership)
  socket.on("join_chat", async (userData) => {
    if (!userData || !userData.chatId || !mongoose.Types.ObjectId.isValid(userData.chatId)) {
      socket.emit("message_error", { error: "Invalid Chat ID" });
      return;
    }

    try {
      const chat = await Chat.findOne({
        _id: userData.chatId,
        users: { $elemMatch: { $eq: socket.userId } }
      });

      if (!chat) {
        socket.emit("message_error", { error: "Access denied" });
        return;
      }

      socket.join(userData.chatId);
      socket.broadcast.emit("user_joined", { chatId: userData.chatId, userId: socket.userId });
    } catch (err) {
      socket.emit("message_error", { error: "Failed to join chat" });
    }
  });

  // Real-time message sending (authorizes user is in chat, uses verified socket.userId)
  socket.on("send_message", async (data) => {
    if (!data || !data.chatId || !mongoose.Types.ObjectId.isValid(data.chatId)) {
      socket.emit("message_error", { error: "Invalid Chat ID" });
      return;
    }

    try {
      // Validate chat exists AND that the sender is a member
      const chat = await Chat.findOne({
        _id: data.chatId,
        users: { $elemMatch: { $eq: socket.userId } }
      });
      if (!chat) {
        socket.emit("message_error", { error: "Chat not found or access denied" });
        return;
      }

      const content = (data.content || "").trim();
      if (content.length > 2000) {
        socket.emit("message_error", { error: "Message length exceeds 2000 character limit" });
        return;
      }

      if (data.imageUrl && !isAllowedImageUrl(data.imageUrl)) {
        socket.emit("message_error", { error: INVALID_IMAGE_URL_MESSAGE });
        return;
      }

      // Save to database
      const message = await Message.create({
        sender: socket.userId,
        content: content,
        chatId: data.chatId,
        messageType: data.messageType || "text",
        imageUrl: data.imageUrl,
        deliveredTo: []
      });

      await Chat.findByIdAndUpdate(data.chatId, {
        latestMessage: message._id,
        updatedAt: new Date()
      }, { timestamps: false });

      // Invalidate caches
      if (redisAvailable) {
        await scanAndUnlink(`messages:${data.chatId}:*`);
        for (const user of chat.users) {
          await scanAndUnlink(`chats:${user.toString()}:*`);
        }
      }

      // Populate sender info
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name pic email");

      const msgObject = populatedMessage.toObject();

      // Emit to OTHER users in the chat room (not back to sender)
      socket.to(data.chatId).emit("receive_message", msgObject);

      // Also echo back to sender with the DB _id so client can deduplicate
      socket.emit("receive_message", msgObject);

    } catch (error) {
      console.error("Error sending message via WS:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Typing indicators
  socket.on("typing_start", async (data) => {
    if (!data || !data.chatId || !mongoose.Types.ObjectId.isValid(data.chatId)) return;
    try {
      const chat = await Chat.findOne({
        _id: data.chatId,
        users: { $elemMatch: { $eq: socket.userId } }
      });
      if (!chat) return;

      await Chat.findByIdAndUpdate(data.chatId, {
        $addToSet: { typingUsers: socket.userId }
      });

      socket.to(data.chatId).emit("user_typing", {
        userId: socket.userId,
        userName: data.userName || "Someone",
        chatId: data.chatId
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("typing_stop", async (data) => {
    if (!data || !data.chatId || !mongoose.Types.ObjectId.isValid(data.chatId)) return;
    try {
      await Chat.findByIdAndUpdate(data.chatId, {
        $pull: { typingUsers: socket.userId }
      });
      socket.to(data.chatId).emit("user_stop_typing", {
        userId: socket.userId,
        chatId: data.chatId
      });
    } catch (err) {
      console.error(err);
    }
  });

  // Message read receipts
  socket.on("message_read", async (data) => {
    if (!data || !data.messageId || !mongoose.Types.ObjectId.isValid(data.messageId)) return;
    if (!data.chatId || !mongoose.Types.ObjectId.isValid(data.chatId)) return;

    try {
      const chat = await Chat.findOne({
        _id: data.chatId,
        users: { $elemMatch: { $eq: socket.userId } }
      });
      if (!chat) return;

      await Message.findByIdAndUpdate(data.messageId, {
        $addToSet: {
          readBy: { user: socket.userId, readAt: new Date() }
        }
      });

      socket.to(data.chatId).emit("message_read_update", {
        messageId: data.messageId,
        userId: socket.userId,
        readAt: new Date()
      });
    } catch (error) {
      console.error("Error updating read status via WS:", error);
    }
  });

  socket.on("disconnect", async () => {
    wsMetrics.activeConnections = Math.max(0, wsMetrics.activeConnections - 1);
    
    if (redisAvailable) {
      try {
        const ipKey = `ws:conn:ip:${socket.ip}`;
        await redisClient.sRem(ipKey, socket.id);

        const userKey = `ws:conn:user:${socket.userId}`;
        await redisClient.sRem(userKey, socket.id);
      } catch (err) {
        console.error("Error removing socket connections tracking from Redis:", err);
      }
    }

    try {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });
      socket.broadcast.emit("user_status_change", {
        userId: socket.userId,
        isOnline: false
      });
    } catch (err) {
      console.error(err);
    }

    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED_REJECTION]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT_EXCEPTION]", error);
});