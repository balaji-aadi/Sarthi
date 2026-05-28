import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Gracefully handle case where MONGODB_URI already contains the DB name and query string,
    // and process.env.DB_NAME is undefined or empty.
    const connectionUri = process.env.DB_NAME 
      ? `${process.env.MONGODB_URI}/${process.env.DB_NAME}?authSource=admin` 
      : process.env.MONGODB_URI;

    await mongoose.connect(connectionUri, {
      maxPoolSize: 20,              // Increased from default 5/10 to handle multiple concurrent API requests without starvation
      serverSelectionTimeoutMS: 5000 // Fast timeout if the database cluster is unresponsive
    });

    console.log(`MongoDB connected! DB HOST: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MONGODB connection FAILED:", error);
    process.exit(1);
  }
};

export default connectDB;
