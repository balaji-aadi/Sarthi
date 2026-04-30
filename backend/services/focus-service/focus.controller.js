import { FocusSession } from "../../models/focusSession.model.js";
import AnalyticsService from "../analytics-service/analytics.service.js";

export const FocusController = {
  createSession: async (req, res) => {
    try {
      const { startTime, endTime, duration, type, date, task, taskName, taskIdString, statusAtCompletion, completionState, estimatedTimeAtStart, backlogTimeAdded, isBacklog, originalDueDate } = req.body;
      const session = new FocusSession({
        user: req.user.id,
        startTime,
        endTime,
        duration,
        type,
        date: date || new Date(),
        task,
        taskName,
        taskIdString,
        statusAtCompletion,
        completionState,
        estimatedTimeAtStart,
        backlogTimeAdded,
        isBacklog,
        originalDueDate
      });
      await session.save();

      // Update Analytics
      await AnalyticsService.recordFocusTime(req.user.id, duration, session.date);

      res.status(201).json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteSession: async (req, res) => {
    try {
      const { id } = req.params;
      const session = await FocusSession.findOneAndDelete({ _id: id, user: req.user.id });
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
      }

      // Update Analytics
      await AnalyticsService.removeFocusTime(req.user.id, session.duration, session.date);

      res.status(200).json({ success: true, message: "Session deleted successfully" });
    } catch (error) {
       res.status(500).json({ success: false, message: error.message });
    }
  },

  getSessions: async (req, res) => {
    try {
      const sessions = await FocusSession.find({ user: req.user.id }).sort({
        date: -1,
      });
      res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getTodayStats: async (req, res) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const sessions = await FocusSession.find({
        user: req.user.id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
      res.status(200).json({
        success: true,
        data: {
          sessionsCount: sessions.length,
          totalDuration,
          sessions,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
