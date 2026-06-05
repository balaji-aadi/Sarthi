import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionUri = process.env.DB_NAME
      ? `${process.env.MONGODB_URI}/${process.env.DB_NAME}?authSource=admin`
      : process.env.MONGODB_URI;

    await mongoose.connect(connectionUri, {
      maxPoolSize: 100,
      serverSelectionTimeoutMS: 30000,
      family: 4
    });

    console.log(`MongoDB connected! DB HOST: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MONGODB connection FAILED:", error);
    process.exit(1);
  }
};

export default connectDB;
