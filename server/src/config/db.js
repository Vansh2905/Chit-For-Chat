import mongoose from "mongoose";

export const dbMetrics = {
  slowQueries: 0,
  queryTimeouts: 0,
  totalQueries: 0,
};

// Global Mongoose plugin to protect against collection scans and runaway queries
mongoose.plugin((schema) => {
  const operations = [
    "find",
    "findOne",
    "findOneAndUpdate",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
    "countDocuments",
  ];

  // Pre-query hook
  schema.pre(operations, function () {
    if (this.options.maxTimeMS === undefined) {
      this.setOptions({ maxTimeMS: 5000 });
    }
    this._startTime = Date.now();
    dbMetrics.totalQueries++;
  });

  // Post-query hook (SUCCESS)
  schema.post(operations, function () {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;

      if (duration > 100) {
        dbMetrics.slowQueries++;
        console.warn(
          `[SLOW QUERY ALERT] ${
            this.model?.modelName || "Unknown"
          }.${this.op} took ${duration}ms`
        );
      }
    }
  });

  // Post-query hook (ERROR) — counts timeouts separately
  schema.post(operations, function (err, res, next) {
    if (err) {
      if (err.codeName === "MaxTimeMSExpired" || err.code === 50) {
        dbMetrics.queryTimeouts++;
        console.error(
          `[QUERY TIMEOUT] ${this.model?.modelName || "Unknown"}.${
            this.op
          } exceeded maxTimeMS`
        );
      } else {
        console.error(
          `[QUERY ERROR] ${this.model?.modelName || "Unknown"}.${this.op}:`,
          err.message
        );
      }
      next(err);
    }
  });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool — reuse connections instead of creating new ones
      maxPoolSize: 10,
      minPoolSize: 2,

      // How long to wait for a connection from the pool
      waitQueueTimeoutMS: 5000,

      // How long to wait when first selecting a server
      serverSelectionTimeoutMS: 5000,

      // Drop connection if no activity for 45s (prevents stale sockets)
      socketTimeoutMS: 45000,

      // Heartbeat every 10s to keep connection alive on Render
      heartbeatFrequencyMS: 10000,
    });

    console.log("✅ MongoDB Connected");

    // Log metrics summary every 5 minutes in production
    if (process.env.NODE_ENV === "production") {
      setInterval(() => {
        const { slowQueries, queryTimeouts, totalQueries } = dbMetrics;
        const slowPct =
          totalQueries > 0
            ? ((slowQueries / totalQueries) * 100).toFixed(1)
            : 0;

        console.log(
          `[DB METRICS] Total: ${totalQueries} | Slow: ${slowQueries} (${slowPct}%) | Timeouts: ${queryTimeouts}`
        );

        // Reset counters after each report
        dbMetrics.slowQueries = 0;
        dbMetrics.queryTimeouts = 0;
        dbMetrics.totalQueries = 0;
      }, 5 * 60 * 1000);
    }
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;