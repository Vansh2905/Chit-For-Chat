import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export let redisAvailable = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
  redisAvailable = false;
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
  redisAvailable = true;
});

redisClient.on("ready", () => {
  redisAvailable = true;
});

redisClient.on("end", () => {
  redisAvailable = false;
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Redis connection failed:", error);
    redisAvailable = false;
  }
};

export default redisClient;
