import express from "express";
import mongoose from "mongoose";
import redisClient, { redisAvailable } from "../config/redis.js";
import { securityMetrics, getRPS } from "../utils/metrics.js";
import { dbMetrics } from "../config/db.js";

const router = express.Router();

// Fail startup if SECURITY_METRICS_KEY is missing
if (!process.env.SECURITY_METRICS_KEY) {
  throw new Error("FATAL ERROR: SECURITY_METRICS_KEY environment variable is missing. Server will not start.");
}

// Global WebSocket metrics storage so server.js can access/update it
export const wsMetrics = {
  activeConnections: 0,
  abuseIncidents: 0,
};

router.get("/metrics", async (req, res) => {
  const secretKey = req.headers["x-security-key"];
  if (!secretKey || secretKey !== process.env.SECURITY_METRICS_KEY) {
    return res.status(401).json({ message: "Unauthorized access to security telemetry" });
  }

  // Calculate Redis latency if available
  let redisLatency = -1;
  if (redisAvailable) {
    try {
      const start = Date.now();
      await redisClient.ping();
      redisLatency = Date.now() - start;
    } catch (err) {
      console.error("[METRICS_ERROR] Failed to ping Redis:", err.message);
    }
  }

  // Get active socket connections (global Socket.io instance reference)
  let socketActiveCount = wsMetrics.activeConnections;
  if (global.io) {
    socketActiveCount = global.io.sockets.sockets.size;
  }

  const metricsData = {
    traffic: {
      requestsPerSecond: getRPS(),
      requestsPerEndpoint: securityMetrics.requestCounts,
      totalHttpRequests: securityMetrics.totalRequests,
    },
    sockets: {
      activeConnections: socketActiveCount,
      abuseEvents: wsMetrics.abuseIncidents,
    },
    redis: {
      availability: redisAvailable ? "connected" : "disconnected",
      latencyMs: redisLatency,
    },
    database: {
      connectionState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      slowQueryCount: dbMetrics.slowQueries,
      queryTimeoutCount: dbMetrics.queryTimeouts,
    },
    security: {
      rateLimitViolations: securityMetrics.rateLimitViolations,
      temporaryBans: securityMetrics.temporaryBans,
      securityIncidents: securityMetrics.abuseEvents,
    }
  };

  res.json(metricsData);
});

export default router;
