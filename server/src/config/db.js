import mongoose from "mongoose";

export const dbMetrics = {
  slowQueries: 0,
  queryTimeouts: 0,
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

});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(
      "✅ MongoDB Connected"
    );
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;