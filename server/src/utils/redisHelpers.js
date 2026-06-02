import redisClient, { redisAvailable } from "../config/redis.js";

/**
 * Periodically scans keys matching a pattern and deletes them using UNLINK (non-blocking).
 * Prevents blocking the Redis single-threaded execution context.
 */
export const scanAndUnlink = async (pattern) => {
  if (!redisAvailable) return;
  try {
    let cursor = "0";
    do {
      // In node-redis v5, scan returns { cursor: string, keys: string[] }.
      // Keep cursor as a string to match the client API shape consistently.
      const reply = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = String(reply.cursor);
      if (reply.keys && reply.keys.length > 0) {
        await redisClient.unlink(reply.keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    console.error("[REDIS_HELPER_ERROR]", error);
    console.error(error.stack);
  }
};
