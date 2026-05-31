import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { isCloudinaryConfigured, uploadImageBuffer } from "../utils/cloudinaryUpload.js";

const router = express.Router();

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_UPLOAD_BYTES = (parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) || 5) * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
    return;
  }
  cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter,
});

const handleMulter = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size must not exceed 5MB" });
    }
    return res.status(400).json({ message: err.message || "Invalid upload" });
  });
};

router.post(
  "/image",
  protect,
  rateLimiter({ keyPrefix: "upload", limit: 5, windowMs: 60000, useUser: true }),
  handleMulter,
  async (req, res) => {
    try {
      if (!isCloudinaryConfigured()) {
        return res.status(503).json({ message: "Image upload service is not configured" });
      }

      if (!req.file?.buffer) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageUrl = await uploadImageBuffer(req.file.buffer, req.user._id.toString());

      res.json({ imageUrl });
    } catch (error) {
      console.error("[UPLOAD] Cloudinary upload failed:", error.message);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

export default router;
