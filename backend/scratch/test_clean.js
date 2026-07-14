import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { FocusSession } from "../models/focusSession.model.js";
import { DailyRevision } from "../models/dailyRevision.model.js";

// Helper to convert date to local date string with 5.5 hours offset (IST)
const getLocalDateStr = (date) => {
  const d = new Date(date);
  // User's timezone offset is -330 mins (IST, +5:30)
  // Let's adjust by adding 5.5 hours to UTC to get local day,
  // then apply the 4 AM boundary offset if the backend uses it.
  // Wait, let's look at getLocalDateString in backend:
  // const adjusted = new Date(d.getTime() - (offsetMinutes * 60 * 1000) - (4 * 60 * 60 * 1000));
  // User is at UTC+5:30. In backend getLocalDateString, offsetMinutes is positive for West, negative for East?
  // Usually, new Date().getTimezoneOffset() returns -330 for IST.
  // Let's check how the backend offset is passed: req.query.timezoneOffset.
  // Let's print the session dates and daily revision dateStr to match them carefully.
  const utcTime = d.getTime();
  const istTime = utcTime + (5.5 * 60 * 60 * 1000);
  const adjusted = new Date(istTime - (4 * 60 * 60 * 1000)); // 4 AM day boundary
  return adjusted.toISOString().split('T')[0];
};

const run = async () => {
  await connectDB();
  try {
    const dailyRevs = await DailyRevision.find({});
    // Map of taskId -> array of dateStr where it was completed
    const taskCompletionDates = {};
    for (const rev of dailyRevs) {
      for (const log of (rev.questionLogs || [])) {
        const taskId = log.taskId.toString();
        if (!taskCompletionDates[taskId]) {
          taskCompletionDates[taskId] = [];
        }
        taskCompletionDates[taskId].push(rev.dateStr);
      }
    }

    console.log("Task Completion Dates Map:", taskCompletionDates);

    const revisionSessions = await FocusSession.find({ type: "Revision" });
    console.log(`\nFound ${revisionSessions.length} total revision focus sessions.`);

    const toKeep = [];
    const toDelete = [];

    for (const session of revisionSessions) {
      const taskId = session.task ? session.task.toString() : null;
      if (!taskId) {
        toDelete.push(session);
        continue;
      }

      // Convert session date/endTime to local YYYY-MM-DD
      const sessionDateStr = getLocalDateStr(session.date || session.endTime);
      const validDates = taskCompletionDates[taskId] || [];

      if (validDates.includes(sessionDateStr)) {
        toKeep.push({ session, sessionDateStr, validDates });
      } else {
        toDelete.push({ session, sessionDateStr, validDates });
      }
    }

    console.log("\n=== SESSIONS TO KEEP ===");
    for (const item of toKeep) {
      console.log(`Keep: ${item.session.taskName} (${item.session.duration}m) on ${item.sessionDateStr}. Valid dates: ${item.validDates}`);
    }

    console.log("\n=== SESSIONS TO DELETE ===");
    for (const item of toDelete) {
      if (item.session) {
        console.log(`Delete: ${item.session.taskName} (${item.session.duration}m) on ${item.sessionDateStr}. Valid dates: ${item.validDates || 'None'} (ID: ${item.session._id})`);
      } else {
        console.log(`Delete: Null session info`);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
