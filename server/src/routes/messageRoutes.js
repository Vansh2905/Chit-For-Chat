import express from "express";
import Message, { Chat } from "../models/message.js";
import { protect } from "../middleware/authMiddleware.js";
import redisClient, { redisAvailable } from "../config/redis.js";
import { scanAndUnlink } from "../utils/redisHelpers.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { isAllowedImageUrl, INVALID_IMAGE_URL_MESSAGE } from "../utils/isAllowedImageUrl.js";
import mongoose from "mongoose";

const router = express.Router();

// Send message with persistence (Rate limited to 30 requests/minute per user)
router.post(
  "/", 
  protect, 
  rateLimiter({ keyPrefix: "send_message", limit: 30, windowMs: 60000, useUser: true }), 
  async (req, res) => {
    try {
      const { content, chatId, messageType = "text", imageUrl } = req.body;
      
      if (!content && !imageUrl) {
        return res.status(400).json({ message: "Content or image required" });
      }
      
      if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Valid Chat ID required" });
      }

      // Verify chat exists AND user is member of chat
      const chat = await Chat.findOne({
        _id: chatId,
        users: { $elemMatch: { $eq: req.user._id } }
      });
      
      if (!chat) {
        return res.status(403).json({ message: "Access denied. You are not a member of this chat." });
      }

      if (imageUrl) {
        if (!isAllowedImageUrl(imageUrl)) {
          return res.status(400).json({ message: INVALID_IMAGE_URL_MESSAGE });
        }
      }

      // Create message in database
      const message = await Message.create({
        sender: req.user._id,
        content: content || "",
        chatId,
        messageType,
        imageUrl,
        deliveredTo: []
      });

      // Update chat's latest message
      await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

      // Populate sender info
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name pic email")
        .populate("chatId");

      // Invalidate caches (using non-blocking scanAndUnlink)
      await scanAndUnlink(`messages:${chatId}:*`);
      for (const memberId of chat.users) {
        await scanAndUnlink(`chats:${memberId.toString()}:*`);
      }

      res.status(201).json(populatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get messages for a chat (Paginated)
router.get("/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Valid Chat ID required" });
    }

    // Verify chat exists AND user is member of chat
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $elemMatch: { $eq: req.user._id } }
    });
    
    if (!chat) {
      return res.status(403).json({ message: "Access denied. You are not a member of this chat." });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const cacheKey = `messages:${chatId}:page:${page}:limit:${limit}`;
    if (redisAvailable) {
      const cachedMessages = await redisClient.get(cacheKey);
      if (cachedMessages) {
        return res.json(JSON.parse(cachedMessages));
      }
    }
    
    const messages = await Message.find({ chatId })
      .populate("sender", "name pic email")
      .populate("readBy.user", "name")
      .sort({ createdAt: -1 }) // Sort newest first for paginated results
      .skip(skip)
      .limit(limit);
    
    // Reverse array to return chronological order to the frontend
    const chronologicalMessages = messages.reverse();

    if (redisAvailable) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(chronologicalMessages)); // Cache for 1 hour
    }
    
    res.json(chronologicalMessages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark message as read
router.put("/:messageId/read", protect, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Valid Message ID required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify chat membership
    const chat = await Chat.findOne({
      _id: message.chatId,
      users: { $elemMatch: { $eq: req.user._id } }
    });
    
    if (!chat) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: {
        readBy: { user: req.user._id, readAt: new Date() }
      }
    });

    // Invalidate caches
    await scanAndUnlink(`messages:${message.chatId}:*`);
    
    res.json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;