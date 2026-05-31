import redisClient, { redisAvailable } from "../config/redis.js";
import { securityMetrics } from "../utils/metrics.js";

const SLIDING_WINDOW_LUA = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local clearBefore = now - window

  redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
  local currentRequests = redis.call('ZCARD', key)

  if currentRequests < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1
  else
    return 0
  end
`;

export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "127.0.0.1";
};

export const rateLimiter = ({ keyPrefix, limit, windowMs, useUser = false }) => {
  return async (req, res, next) => {
    if (!redisAvailable) {
      console.warn(`[RATE_LIMIT_WARNING] Redis unavailable. Bypassing rate limit check for ${keyPrefix}`);
      return next();
    }

    let identifier;
    if (useUser) {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized for rate limiting check" });
      }
      identifier = req.user._id.toString();
    } else {
      identifier = getClientIp(req);
    }

    const key = `ratelimit:${keyPrefix}:${identifier}`;
    const now = Date.now();

    try {
      const allowed = await redisClient.eval(SLIDING_WINDOW_LUA, {
        keys: [key],
        arguments: [String(now), String(windowMs), String(limit)]
      });

      if (allowed === 1) {
        next();
      } else {
        securityMetrics.rateLimitViolations++;
        console.warn(`[SECURITY_ALERT] Rate limit exceeded for ${keyPrefix} by ${identifier}`);
        return res.status(429).json({
          message: "Too many requests, please try again later.",
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
    } catch (error) {
      console.error(`[RATE_LIMIT_ERROR] Failed to run rate limiter for ${keyPrefix}:`, error);
      // Graceful fallback on outage
      next();
    }
  };
};
