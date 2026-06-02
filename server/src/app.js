import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import { trackRequest } from "./utils/metrics.js";

dotenv.config();
connectDB();
connectRedis();

const app = express();
app.set("trust proxy", 1);

// Parse CORS Allowed Origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  // Safe default for development
  allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(helmet());

// Track API traffic metrics
app.use((req, res, next) => {
  trackRequest(req.method + " " + req.path);
  next();
});

// Limit JSON request body payload size (default 10KB)
const maxJsonLimit = `${parseInt(process.env.MAX_JSON_BODY_KB, 10) || 10}kb`;
app.use(express.json({ limit: maxJsonLimit }));

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/security", securityRoutes);

app.use((err, req, res, next) => {
  if (err?.message?.includes("CORS policy violation")) {
    return res.status(403).json({ message: "Origin not allowed" });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ message: "Payload too large" });
  }
  console.error("[UNHANDLED_API_ERROR]", err);
  return res.status(500).json({ message: "Internal server error" });
});

export default app;