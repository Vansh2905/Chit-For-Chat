import express from "express";
import { Chat } from "../models/message.js";
import { protect } from "../middleware/authMiddleware.js";
import redisClient, { redisAvailable } from "../config/redis.js";
import { scanAndUnlink } from "../utils/redisHelpers.js";
import mongoose from "mongoose";

const router = express.Router();

// Create or get existing chat between two users
router.post("/", protect, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    // Prevents NoSQL injection / validation error
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
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
    await scanAndUnlink(`chats:${req.user._id}:*`);
    await scanAndUnlink(`chats:${userId}:*`);

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all chats for logged in user (Paginated)
router.get("/", protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const cacheKey = `chats:${req.user._id}:page:${page}:limit:${limit}`;
    if (redisAvailable) {
      const cachedChats = await redisClient.get(cacheKey);
      if (cachedChats) {
        return res.json(JSON.parse(cachedChats));
      }
    }

    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
    .populate("users", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

    if (redisAvailable) {
      await redisClient.setEx(cacheKey, 120, JSON.stringify(chats));
    }
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

    if (!Array.isArray(users)) {
      return res.status(400).json({ message: "Users must be an array" });
    }

    if (users.length < 2) {
      return res.status(400).json({ message: "Group chat needs at least 2 users" });
    }

    // Validate users
    const cleanUsers = [];
    for (const uId of users) {
      if (!mongoose.Types.ObjectId.isValid(uId)) {
        return res.status(400).json({ message: `Invalid User ID format: ${uId}` });
      }
      cleanUsers.push(uId);
    }
    cleanUsers.push(req.user._id.toString());

    const chat = await Chat.create({
      chatName: chatName.trim(),
      users: cleanUsers,
      isGroupChat: true,
      groupAdmin: req.user._id
    });

    const fullChat = await Chat.findById(chat._id).populate("users", "-password");

    // Invalidate chats cache for all group members
    for (const memberId of cleanUsers) {
      await scanAndUnlink(`chats:${memberId}:*`);
    }

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;