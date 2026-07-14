import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { FocusSession } from "../models/focusSession.model.js";

const run = async () => {
  await connectDB();
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const endToday = new Date();
    endToday.setHours(23,59,59,999);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0,0,0,0);
    const endYesterday = new Date();
    endYesterday.setDate(endYesterday.getDate() - 1);
    endYesterday.setHours(23,59,59,999);

    console.log("=== FOCUS SESSIONS TODAY (Jul 13) ===");
    const todaySessions = await FocusSession.find({
      date: { $gte: today, $lte: endToday }
    }).sort({ createdAt: 1 });

    for (const session of todaySessions) {
      console.log(`- ${session.taskName} (${session.duration}m), type: ${session.type}, date: ${session.date.toISOString()}`);
    }

    console.log("\n=== FOCUS SESSIONS YESTERDAY (Jul 12) ===");
    const yesterdaySessions = await FocusSession.find({
      date: { $gte: yesterday, $lte: endYesterday }
    }).sort({ createdAt: 1 });

    for (const session of yesterdaySessions) {
      console.log(`- ${session.taskName} (${session.duration}m), type: ${session.type}, date: ${session.date.toISOString()}`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
