import mongoose from "mongoose";

// Connection lifecycle logging
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established successfully.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection disconnected. Mongoose will attempt to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB connection re-established.");
});

const connectDB = async (retryCount = 5, delay = 3000) => {
  const connectionUri = process.env.DB_NAME
    ? `${process.env.MONGODB_URI}/${process.env.DB_NAME}?authSource=admin`
    : process.env.MONGODB_URI;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      await mongoose.connect(connectionUri, {
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 45000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
      });

      console.log(`MongoDB connected! DB HOST: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retryCount} failed:`, error.message);
      if (attempt < retryCount) {
        console.log(`Retrying connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("All MongoDB connection attempts failed.");
        throw error;
      }
    }
  }
};

export default connectDB;
