import express from "express";
import Message, { Chat } from "../models/message.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send message with persistence
router.post("/", protect, async (req, res) => {
  try {
    const { content, chatId, messageType = "text", imageUrl } = req.body;
    
    if (!content && !imageUrl) {
      return res.status(400).json({ message: "Content or image required" });
    }
    
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID required" });
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

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get messages for a chat
router.get("/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const messages = await Message.find({ chatId })
      .populate("sender", "name pic email")
      .populate("readBy.user", "name")
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark message as read
router.put("/:messageId/read", protect, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: {
        readBy: { user: req.user._id, readAt: new Date() }
      }
    });
    
    res.json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;