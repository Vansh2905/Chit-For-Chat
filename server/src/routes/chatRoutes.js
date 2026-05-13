import express from "express";
import { Chat } from "../models/message.js";
import { protect } from "../middleware/authMiddleware.js";
import redisClient from "../config/redis.js";

const router = express.Router();

// Create or get existing chat between two users
router.post("/", protect, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    // Check if chat already exists between these two users
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] }
    }).populate("users", "-password").populate("latestMessage");

    if (chat) {
      return res.json(chat);
    }

    // Create new chat
    chat = await Chat.create({
      users: [req.user._id, userId],
      isGroupChat: false
    });

    chat = await Chat.findById(chat._id).populate("users", "-password");

    // Invalidate chats cache for both users
    await redisClient.del(`chats:${req.user._id}`);
    await redisClient.del(`chats:${userId}`);

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all chats for logged in user
router.get("/", protect, async (req, res) => {
  try {
    const cacheKey = `chats:${req.user._id}`;
    const cachedChats = await redisClient.get(cacheKey);

    if (cachedChats) {
      return res.json(JSON.parse(cachedChats));
    }

    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
    .populate("users", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

    await redisClient.setEx(cacheKey, 120, JSON.stringify(chats));
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create group chat
router.post("/group", protect, async (req, res) => {
  try {
    const { users, chatName } = req.body;
    
    if (!users || !chatName) {
      return res.status(400).json({ message: "Users and chat name required" });
    }

    if (users.length < 2) {
      return res.status(400).json({ message: "Group chat needs at least 2 users" });
    }

    users.push(req.user._id);

    const chat = await Chat.create({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin: req.user._id
    });

    const fullChat = await Chat.findById(chat._id).populate("users", "-password");

    // Invalidate chats cache for all group members
    for (const memberId of users) {
      await redisClient.del(`chats:${memberId}`);
    }

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;