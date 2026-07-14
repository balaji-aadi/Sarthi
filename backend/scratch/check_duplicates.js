import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { FocusSession } from "../models/focusSession.model.js";
import { DailyRevision } from "../models/dailyRevision.model.js";

const run = async () => {
  await connectDB();
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const endToday = new Date();
    endToday.setHours(23,59,59,999);

    console.log("=== FOCUS SESSIONS TODAY ===");
    const sessions = await FocusSession.find({
      date: { $gte: today, $lte: endToday }
    }).sort({ createdAt: 1 });

    for (const session of sessions) {
      console.log({
        id: session._id,
        taskName: session.taskName,
        type: session.type,
        duration: session.duration,
        createdAt: session.createdAt,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime
      });
    }

    console.log("=== DAILY REVISIONS ===");
    const revisions = await DailyRevision.find({}).sort({ dateStr: -1 }).limit(5);
    for (const rev of revisions) {
      console.log({
        dateStr: rev.dateStr,
        isCompleted: rev.isCompleted,
        completedQuestions: rev.completedQuestions,
        questionLogs: rev.questionLogs
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
