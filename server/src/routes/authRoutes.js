import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { verifyGoogleIdToken } from "../utils/verifyGoogleToken.js";

const router = express.Router();

const LEGACY_GOOGLE_PASSWORD = "google-oauth";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const formatAuthResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  pic: user.pic,
  authProvider: user.authProvider,
  token,
});

const isLegacyGoogleUser = (user) =>
  user.password === LEGACY_GOOGLE_PASSWORD ||
  (user.authProvider === "google" && !user.googleId);

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isGoogleHostedProfilePic = (value) => {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === "lh3.googleusercontent.com" || hostname.endsWith(".googleusercontent.com");
  } catch {
    return false;
  }
};

// Register
router.post("/register", rateLimiter({ keyPrefix: "signup", limit: 3, windowMs: 60000 }), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ message: "Name must be between 2 and 50 characters" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 6 and 128 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.authProvider === "google" || isLegacyGoogleUser(existing)) {
        return res.status(409).json({
          message: "An account with this email uses Google sign-in. Please continue with Google.",
        });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
    });

    res.status(201).json(formatAuthResponse(user, generateToken(user._id)));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", rateLimiter({ keyPrefix: "login", limit: 5, windowMs: 60000 }), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email) || typeof password !== "string" || password.length === 0) {
      return res.status(400).json({ message: "Valid email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(401).json({
        message: "This account uses Google sign-in. Please continue with Google.",
      });
    }

    if (isLegacyGoogleUser(user)) {
      return res.status(401).json({
        message: "This account uses Google sign-in. Please continue with Google.",
      });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await User.findByIdAndUpdate(user._id, {
      isOnline: true,
      lastSeen: new Date(),
    });

    user.password = undefined;
    res.json(formatAuthResponse(user, generateToken(user._id)));
  } catch (error) {
    console.error("[LOGIN ERROR]");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      message: error.message,
      name: error.name,
    });
  }
});

// Google OAuth — verified ID token only
router.post(
  "/google",
  rateLimiter({ keyPrefix: "google", limit: 10, windowMs: 60000 }),
  async (req, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken || typeof idToken !== "string") {
        return res.status(400).json({ message: "Google ID token is required" });
      }

      let googleUser;
      try {
        googleUser = await verifyGoogleIdToken(idToken);
      } catch (verifyError) {
        console.warn("[AUTH] Google ID token verification failed:", verifyError.message);
        return res.status(401).json({ message: "Invalid or expired Google sign-in" });
      }

      const { email, name, picture, googleId } = googleUser;

      let user = await User.findOne({ googleId });

      if (!user) {
        user = await User.findOne({ email });
      }

      if (user) {
        if (user.authProvider === "local" && user.password && !isLegacyGoogleUser(user)) {
          return res.status(409).json({
            message:
              "An account with this email already exists. Sign in with your email and password.",
          });
        }

        if (user.googleId && user.googleId !== googleId) {
          return res.status(409).json({ message: "Google account conflict. Contact support." });
        }

        const update = {
          authProvider: "google",
          googleId,
          isOnline: true,
          lastSeen: new Date(),
          name,
        };

        // Preserve user-customized profile pictures.
        // Only refresh avatar from Google if current pic is empty or still Google-hosted.
        if (picture && (!user.pic || isGoogleHostedProfilePic(user.pic))) {
          update.pic = picture;
        }

        user = await User.findByIdAndUpdate(
          user._id,
          {
            $set: update,
            $unset: { password: "" },
          },
          { new: true, runValidators: true }
        );
      } else {
        user = await User.create({
          name,
          email,
          pic: picture || undefined,
          googleId,
          authProvider: "google",
        });

        await User.findByIdAndUpdate(user._id, {
          isOnline: true,
          lastSeen: new Date(),
        });
      }

      res.json(formatAuthResponse(user, generateToken(user._id)));
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      if (error.name === "MongoServerError" && error.code === 11000) {
        return res.status(409).json({ message: "Unable to link Google account. Try again." });
      }
      console.error("[AUTH] Google sign-in error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
