import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { Message, Chat } from "./models/message.js";
import User from "./models/user.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://chit-for-chat-client.vercel.app",
      process.env.CLIENT_URL
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_online", async (userId) => {
    await User.findByIdAndUpdate(userId, { isOnline: true });
    socket.broadcast.emit("user_status_change", { userId, isOnline: true });
  });

  socket.on("join_chat", (userData) => {
    users.set(socket.id, userData);
    socket.join(userData.chatId);
    socket.broadcast.emit("user_joined", userData);
  });

  // Real-time message sending with persistence
  socket.on("send_message", async (data) => {
    try {
      // Validate chat exists
      const chat = await Chat.findById(data.chatId);
      if (!chat) {
        socket.emit("message_error", { error: "Chat not found" });
        return;
      }

      // Save to database
      const message = await Message.create({
        sender: data.sender,
        content: data.content || "",   
        chatId: data.chatId,
        messageType: data.messageType || "text",
        imageUrl: data.imageUrl,
        deliveredTo: []
      });


      await Chat.findByIdAndUpdate(data.chatId, {
        latestMessage: message._id,
        updatedAt: new Date()
      }, { timestamps: false });

      // Populate sender info
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name pic email");

      const msgObject = populatedMessage.toObject();

      // Emit to OTHER users in the chat room (not back to sender)
      // The sender already has the message in their own state
      socket.to(data.chatId).emit("receive_message", msgObject);

      // Also echo back to sender with the DB _id so client can deduplicate
      socket.emit("receive_message", msgObject);

    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing_start", async (data) => {
    await Chat.findByIdAndUpdate(data.chatId, {
      $addToSet: { typingUsers: data.userId }
    });
    socket.to(data.chatId).emit("user_typing", {
      userId: data.userId,
      userName: data.userName,
      chatId: data.chatId
    });
  });

  socket.on("typing_stop", async (data) => {
    await Chat.findByIdAndUpdate(data.chatId, {
      $pull: { typingUsers: data.userId }
    });
    socket.to(data.chatId).emit("user_stop_typing", {
      userId: data.userId,
      chatId: data.chatId
    });
  });

  // Message read receipt
  socket.on("message_read", async (data) => {
    try {
      await Message.findByIdAndUpdate(data.messageId, {
        $addToSet: {
          readBy: { user: data.userId, readAt: new Date() }
        }
      });

      socket.to(data.chatId).emit("message_read_update", {
        messageId: data.messageId,
        userId: data.userId,
        readAt: new Date()
      });
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  });

  socket.on("disconnect", async () => {
    const user = users.get(socket.id);
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        isOnline: false,
        lastSeen: new Date()
      });
      socket.broadcast.emit("user_status_change", {
        userId: user._id,
        isOnline: false
      });
      users.delete(socket.id);
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));