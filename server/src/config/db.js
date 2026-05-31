import mongoose from "mongoose";

export const dbMetrics = {
  slowQueries: 0,
  queryTimeouts: 0,
};

// Global Mongoose plugin to protect against collection scans and unindexed/runaway queries
mongoose.plugin((schema) => {
  // Pre-query hook: Enforce 5000ms query timeout limit & track start time
  schema.pre(["find", "findOne", "findOneAndUpdate", "updateOne", "updateMany", "deleteOne", "deleteMany", "countDocuments"], function(next) {
    if (this.options.maxTimeMS === undefined) {
      this.setOptions({ maxTimeMS: 5000 }); // Enforce 5 seconds query timeout
    }
    this._startTime = Date.now();
    next();
  });

  // Post-query hook: Measure duration and flag queries taking > 100ms as slow
  schema.post(["find", "findOne", "findOneAndUpdate", "updateOne", "updateMany", "deleteOne", "deleteMany", "countDocuments"], function(res, next) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      if (duration > 100) {
        dbMetrics.slowQueries++;
        console.warn(`[SLOW QUERY ALERT] ${this.model?.modelName || "Unknown"}.${this.op} took ${duration}ms`);
      }
    }
    next();
  });

  // Error hook: Catch and count query timeout errors
  schema.post(["find", "findOne", "findOneAndUpdate", "updateOne", "updateMany", "deleteOne", "deleteMany", "countDocuments"], function(error, res, next) {
    if (error && (error.name === "MaxTimeMSExpired" || error.code === 50 || error.message?.includes("timeout"))) {
      dbMetrics.queryTimeouts++;
      console.error(`[DATABASE TIMEOUT] Query timed out on ${this.model?.modelName || "Unknown"}.${this.op}`);
    }
    next(error);
  });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected with global protection filters");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
