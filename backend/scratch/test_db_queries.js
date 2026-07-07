import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";

async function run() {
  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("Connected successfully.");

  console.log("1. Running simple findOne query on User...");
  try {
    const user = await User.findOne({});
    console.log("   - User query completed. Result ID:", user ? user._id : "None");
  } catch (err) {
    console.error("   - User query failed:", err);
  }

  console.log("2. Running find query on Project...");
  try {
    const projects = await Project.find({});
    console.log("   - Project query completed. Projects count:", projects.length);
  } catch (err) {
    console.error("   - Project query failed:", err);
  }

  console.log("Database queries test completed.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Connection/run failed:", err);
  process.exit(1);
});
