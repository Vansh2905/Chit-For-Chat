import express from "express";
import User from "../models/user.js";
import { protect } from "../middleware/authMiddleware.js";
import redisClient, { redisAvailable } from "../config/redis.js";
import { scanAndUnlink } from "../utils/redisHelpers.js";
import { isAllowedImageUrl, INVALID_IMAGE_URL_MESSAGE } from "../utils/isAllowedImageUrl.js";

const router = express.Router();

// Get all users (Paginated)
router.get("/", protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const cacheKey = `users:${req.user._id}:page:${page}:limit:${limit}`;
    if (redisAvailable) {
      const cachedUsers = await redisClient.get(cacheKey);
      if (cachedUsers) {
        return res.json(JSON.parse(cachedUsers));
      }
    }

    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ isOnline: -1, lastSeen: -1 })
      .skip(skip)
      .limit(limit);
    
    if (redisAvailable) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(users));
    }
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

    // Validate size and character length
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0 || name.length > 50) {
        return res.status(400).json({ message: "Name must be between 1 and 50 characters" });
      }
      updateFields.name = name.trim();
    }
    
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 200) {
        return res.status(400).json({ message: "Bio cannot exceed 200 characters" });
      }
      updateFields.bio = bio.trim();
    }

    if (pic !== undefined) {
      if (typeof pic !== "string" || pic.length > 2000) {
        return res.status(400).json({ message: "Invalid image URL" });
      }
      if (!isAllowedImageUrl(pic)) {
        return res.status(400).json({ message: INVALID_IMAGE_URL_MESSAGE });
      }
      updateFields.pic = pic;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    // Invalidate all users caches because user profile updated
    await scanAndUnlink("users:*");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update online status
router.put("/status", protect, async (req, res) => {
  try {
    const { isOnline } = req.body;
    if (typeof isOnline !== "boolean") {
      return res.status(400).json({ message: "isOnline must be a boolean" });
    }
    
    await User.findByIdAndUpdate(req.user._id, {
      isOnline,
      lastSeen: new Date()
    });

    // Invalidate users caches
    await scanAndUnlink("users:*");

    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;