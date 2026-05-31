import redisClient, { redisAvailable } from "../config/redis.js";

/**
 * Periodically scans keys matching a pattern and deletes them using UNLINK (non-blocking).
 * Prevents blocking the Redis single-threaded execution context.
 */
export const scanAndUnlink = async (pattern) => {
  if (!redisAvailable) return;
  try {
    let cursor = 0;
    do {
      // In node-redis v4/v5, scan returns { cursor: number, keys: string[] }
      const reply = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = reply.cursor;
      if (reply.keys && reply.keys.length > 0) {
        await redisClient.unlink(reply.keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error(`[REDIS_HELPER_ERROR] scanAndUnlink failed for pattern ${pattern}:`, error);
  }
};
