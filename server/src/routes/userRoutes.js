import express from "express";
import User from "../models/user.js";
import { protect } from "../middleware/authMiddleware.js";
import redisClient from "../config/redis.js";

const router = express.Router();

// Get all users
router.get("/", protect, async (req, res) => {
  try {
    const cacheKey = `users:${req.user._id}`;
    const cachedUsers = await redisClient.get(cacheKey);

    if (cachedUsers) {
      return res.json(JSON.parse(cachedUsers));
    }

    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ isOnline: -1, lastSeen: -1 });
    
    await redisClient.setEx(cacheKey, 60, JSON.stringify(users));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, bio, pic } = req.body;

    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (pic !== undefined) updateFields.pic = pic;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update online status
router.put("/status", protect, async (req, res) => {
  try {
    const { isOnline } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      isOnline,
      lastSeen: new Date()
    });
    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;