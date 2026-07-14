import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { FocusSession } from "../models/focusSession.model.js";
import { DailyRevision } from "../models/dailyRevision.model.js";

const getLocalDateStr = (date) => {
  const d = new Date(date);
  const utcTime = d.getTime();
  const istTime = utcTime + (5.5 * 60 * 60 * 1000);
  const adjusted = new Date(istTime - (4 * 60 * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
};

const run = async () => {
  await connectDB();
  try {
    const dailyRevs = await DailyRevision.find({});
    // We will build a list of expected revision logs:
    // array of { dateStr, taskId, duration, matched: false }
    const expectedLogs = [];
    for (const rev of dailyRevs) {
      for (const log of (rev.questionLogs || [])) {
        const duration = Math.max(1, Math.round((log.timeSpent || 900) / 60));
        expectedLogs.push({
          dateStr: rev.dateStr,
          taskId: log.taskId.toString(),
          duration,
          matched: false
        });
      }
    }

    const revisionSessions = await FocusSession.find({ type: "Revision" }).sort({ createdAt: 1 });
    console.log(`Found ${revisionSessions.length} total revision focus sessions.`);

    const toKeep = [];
    const toDelete = [];

    for (const session of revisionSessions) {
      const taskId = session.task ? session.task.toString() : null;
      if (!taskId) {
        toDelete.push({ session, reason: "No taskId" });
        continue;
      }

      const sessionDateStr = getLocalDateStr(session.date || session.endTime);
      
      // Find a matching expected log
      const match = expectedLogs.find(el => 
        !el.matched && 
        el.dateStr === sessionDateStr && 
        el.taskId === taskId && 
        Math.abs(el.duration - session.duration) <= 1
      );

      if (match) {
        match.matched = true;
        toKeep.push({ session, sessionDateStr, match });
      } else {
        toDelete.push({ session, sessionDateStr, reason: "No corresponding expected log" });
      }
    }

    console.log("\n=== SESSIONS TO KEEP ===");
    for (const item of toKeep) {
      console.log(`Keep: ${item.session.taskName} (${item.session.duration}m) on ${item.sessionDateStr} (ID: ${item.session._id})`);
    }

    console.log("\n=== SESSIONS TO DELETE ===");
    for (const item of toDelete) {
      console.log(`Delete: ${item.session.taskName} (${item.session.duration}m) on ${item.sessionDateStr} - Reason: ${item.reason} (ID: ${item.session._id})`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
