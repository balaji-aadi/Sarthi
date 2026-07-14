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

    console.log(`\nDeleting ${toDelete.length} duplicated focus sessions...`);
    for (const item of toDelete) {
      console.log(`Deleting duplicate: ${item.session.taskName} (${item.session.duration}m) on ${item.sessionDateStr}`);
      await FocusSession.deleteOne({ _id: item.session._id });
    }
    console.log("Cleanup complete!");

  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
