import { PerformanceStat } from "../../models/performanceStat.model.js";
import { Task } from "../../models/task.model.js";
import { FocusSession } from "../../models/focusSession.model.js";
import { DailyAccountability } from "../../models/dailyAccountability.model.js";
import mongoose from "mongoose";
import moment from "moment";

class AnalyticsService {
  /**
   * Main entry point to update stats when a task is updated
   */
  async handleTaskUpdate(userId, projectId, taskId, oldStatus, newStatus) {
    console.log(`[Analytics] handleTaskUpdate: User:${userId}, Project:${projectId}, Task:${taskId}, Status:${oldStatus}->${newStatus}`);
    if (!userId || !projectId) return;

    // Only trigger if status actually changed
    if (oldStatus === newStatus) return;

    const task = await Task.findById(taskId);
    if (!task) return;

    const branchId = task.branchId;
    const date = new Date();
    await this._recordStatUpdate(userId, projectId, task, oldStatus, newStatus, date, branchId);
  }

  /**
   * Internal helper to record stats for both user and project across all periods
   */
  async _recordStatUpdate(userId, projectId, task, oldStatus, newStatus, date, branchId) {
    const periods = ["daily", "weekly", "monthly", "yearly"];
    for (const period of periods) {
      const normalizedDate = this._normalizeDate(date, period);
      // Update User Stats
      await this._updateStats("user", userId, period, normalizedDate, task, oldStatus, newStatus, branchId);
      // Update Project Stats
      await this._updateStats("project", projectId, period, normalizedDate, task, oldStatus, newStatus, branchId);
    }
  }

  /**
   * Sync all existing tasks to populate analytics
   */
  async syncAllExistingData() {
    // Clear existing stats to avoid double counting during a full sync
    await PerformanceStat.deleteMany({});

    const tasks = await Task.find({}).populate("activityLogs.user");
    console.log(`Syncing analytics for ${tasks.length} tasks...`);

    for (const task of tasks) {
      if (!task.assignee || !task.projectName) continue;

      // 1. Basic metrics (Completed, Points, On-Time)
      const createdDate = task.createdAt || new Date();
      const updatedDate = task.updatedAt || new Date();

      // Find the exact completion or inprogress date from activity logs to be highly precise
      let statusChangeDate = updatedDate;
      if (task.status === "done" && task.activityLogs && task.activityLogs.length > 0) {
          const doneLog = [...task.activityLogs].reverse().find(log => log.currentStatus === "done");
          if (doneLog) {
              statusChangeDate = doneLog.date;
          }
      } else if (task.status === "inprogress" && task.activityLogs && task.activityLogs.length > 0) {
          const inprogressLog = [...task.activityLogs].reverse().find(log => log.currentStatus === "inprogress");
          if (inprogressLog) {
              statusChangeDate = inprogressLog.date;
          }
      }

      // Initial assignment stat
      await this._recordStatUpdate(task.assignee, task.projectName, task, null, "todo", createdDate, task.branchId);
      
      // If currently not todo, update to current status
      if (task.status !== "todo") {
          await this._recordStatUpdate(task.assignee, task.projectName, task, "todo", task.status, statusChangeDate, task.branchId);
      }

      // 2. Historical Hours Logged from Activity Logs
      // We need to find all durations where status was 'inprogress'
      if (task.activityLogs && task.activityLogs.length > 1) {
          const sortedLogs = [...task.activityLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
          
          let lastInprogressDate = null;
          for (const log of sortedLogs) {
              if (log.currentStatus === "inprogress") {
                  lastInprogressDate = new Date(log.date);
              } else if (lastInprogressDate && log.oldStatus === "inprogress") {
                  const ms = new Date(log.date) - lastInprogressDate;
                  const hours = Number((ms / (1000 * 60 * 60)).toFixed(2));
                  if (hours > 0) {
                      // Apply these hours to the date they were logged
                      await this._incrementHoursOnly(task.assignee, task.projectName, hours, log.date, task.branchId);
                  }
                  lastInprogressDate = null;
              }
          }
      }
    }

    // 3. Sync all Focus Sessions
    const focusSessions = await FocusSession.find({});
    console.log(`Syncing analytics for ${focusSessions.length} focus sessions...`);
    for (const session of focusSessions) {
        if (!session.user || !session.duration) continue;
        
        // Add Focus Session duration to user's stats
        await this.recordFocusTime(session.user, session.duration, session.date || session.startTime, session.branchId);
        
        // If the focus session is linked to a task, optionally add to project stats
        if (session.task) {
            const task = await Task.findById(session.task);
            if (task && task.projectName) {
                const hours = Number((session.duration / 60).toFixed(2));
                const periods = ["daily", "weekly", "monthly", "yearly"];
                for (const period of periods) {
                    const normalizedDate = this._normalizeDate(session.date || session.startTime, period);
                    const query = { entityType: "project", entityId: task.projectName, period, date: normalizedDate };
                    if (session.branchId) {
                        query.branchId = session.branchId;
                    } else if (task.branchId) {
                        query.branchId = task.branchId;
                    }
                    await PerformanceStat.findOneAndUpdate(
                        query,
                        { $inc: { "metrics.hoursLogged": hours } },
                        { upsert: true }
                    );
                }
            }
        }
    }

    // 4. Sync Daily Accountability Logs
    const accountabilityBoards = await DailyAccountability.find({});
    console.log(`Syncing analytics for ${accountabilityBoards.length} daily accountability boards...`);
    for (const board of accountabilityBoards) {
        if (!board.userId) continue;
        
        const userDoc = await mongoose.model("User").findById(board.userId);
        const defaultBranchId = userDoc?.branchAccess?.[0]?.branchId;

        const dateCounts = {};
        
        // Count logs per logic day date string
        (board.sections || []).forEach(sec => {
            (sec.rows || []).forEach(row => {
                if (row.date) {
                    dateCounts[row.date] = (dateCounts[row.date] || 0) + 1;
                }
            });
        });
        
        // Apply to PerformanceStat
        for (const [dateStr, count] of Object.entries(dateCounts)) {
            const dateObj = new Date(dateStr);
            if (isNaN(dateObj)) continue;
            
            const periods = ["daily", "weekly", "monthly", "yearly"];
            for (const period of periods) {
                const normalizedDate = this._normalizeDate(dateObj, period);
                const query = { entityType: "user", entityId: board.userId, period, date: normalizedDate };
                if (defaultBranchId) {
                    query.branchId = defaultBranchId;
                }
                await PerformanceStat.findOneAndUpdate(
                    query,
                    { $set: { "metrics.accountabilityLogs": count } },
                    { upsert: true }
                );
            }
        }
    }

    return { 
        tasksProcessed: tasks.length, 
        focusSessionsProcessed: focusSessions.length,
        accountabilityBoardsProcessed: accountabilityBoards.length 
    };
  }

  async _incrementHoursOnly(userId, projectId, hours, date, branchId) {
      const periods = ["daily", "weekly", "monthly", "yearly"];
      for (const period of periods) {
          const normalizedDate = this._normalizeDate(date, period);
          const update = { $inc: { "metrics.hoursLogged": hours } };
          
          const queryUser = { entityType: "user", entityId: userId, period, date: normalizedDate };
          const queryProject = { entityType: "project", entityId: projectId, period, date: normalizedDate };
          if (branchId) {
              queryUser.branchId = branchId;
              queryProject.branchId = branchId;
          }
          
          await PerformanceStat.findOneAndUpdate(
              queryUser,
              update,
              { upsert: true }
          );
          await PerformanceStat.findOneAndUpdate(
              queryProject,
              update,
              { upsert: true }
          );
      }
  }

  /**
   * Update or create a PerformanceStat record
   */
  async _updateStats(entityType, entityId, period, date, task, oldStatus, newStatus, branchId) {
    const update = { $inc: {} };

    // Initial Assignment Tracking
    if (oldStatus === null) {
        update.$inc["metrics.totalTasksAssigned"] = 1;
    }

    // Task Completion Metrics
    if (newStatus === "done") {
      update.$inc["metrics.tasksCompleted"] = 1;
      update.$inc["metrics.storyPointsDone"] = task.storyPoints || 0;

      // Check for on-time completion vs backlog completion
      if (task.taskDueDate) {
        const isLate = moment(date).isAfter(moment(task.taskDueDate), 'day');
        if (isLate) {
          update.$inc["metrics.delayedTasks"] = 1;
          update.$inc["metrics.backlogTasksCompleted"] = 1;
        } else {
          update.$inc["metrics.onTimeTasks"] = 1;
        }
      }
    }

    // Task Reopened logic (done -> anything else)
    if (oldStatus === "done" && newStatus !== "done") {
      update.$inc["metrics.tasksCompleted"] = -1;
      update.$inc["metrics.storyPointsDone"] = -(task.storyPoints || 0);
      update.$inc["metrics.reopenedTasks"] = 1;
      
      // Reverse on-time/delayed
      if (task.taskDueDate) {
        const wasLate = moment(date).isAfter(moment(task.taskDueDate));
        if (wasLate) {
           update.$inc["metrics.delayedTasks"] = -1;
        } else {
           update.$inc["metrics.onTimeTasks"] = -1;
        }
      }
    }

    // --- TIME LOGGING LOGIC ---
    if (oldStatus === "inprogress" && task.activityLogs && task.activityLogs.length >= 2) {
        const sortedLogs = [...task.activityLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const outLog = sortedLogs[0];
        const inLog = sortedLogs[1];

        if (inLog.currentStatus === "inprogress") {
            const ms = new Date(outLog.date) - new Date(inLog.date);
            const hours = ms / (1000 * 60 * 60);
            if (hours > 0) {
                update.$inc["metrics.hoursLogged"] = Number(hours.toFixed(2));
                
                const isLate = task.taskDueDate ? moment(date).isAfter(moment(task.taskDueDate), 'day') : false;
                if (isLate || task.status === 'backlog') {
                   update.$inc["metrics.backlogHoursLogged"] = Number(hours.toFixed(2));
                }
            }
        }
    }

    const query = { entityType, entityId, period, date };
    if (branchId) {
        query.branchId = branchId;
    }

    // Use findOneAndUpdate with upsert to handle increments gracefully
    await PerformanceStat.findOneAndUpdate(
      query,
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Handle task deletion to reverse stats
   */
  async handleTaskDeletion(task) {
    if (!task || !task.assignee || !task.projectName) return;

    const date = task.updatedAt || task.createdAt || new Date();
    const periods = ["daily", "weekly", "monthly", "yearly"];
    const branchId = task.branchId;

    for (const period of periods) {
      const normalizedDate = this._normalizeDate(date, period);
      const update = { $inc: {} };

      // Reverse basic metrics
      update.$inc["metrics.totalTasksAssigned"] = -1;
      
      if (task.status === "done") {
        update.$inc["metrics.tasksCompleted"] = -1;
        update.$inc["metrics.storyPointsDone"] = -(task.storyPoints || 0);

        if (task.taskDueDate) {
          const isLate = moment(date).isAfter(moment(task.taskDueDate));
          if (isLate) {
            update.$inc["metrics.delayedTasks"] = -1;
          } else {
            update.$inc["metrics.onTimeTasks"] = -1;
          }
        }
      }
      
      const queryUser = { entityType: "user", entityId: task.assignee, period, date: normalizedDate };
      const queryProject = { entityType: "project", entityId: task.projectName, period, date: normalizedDate };
      if (branchId) {
          queryUser.branchId = branchId;
          queryProject.branchId = branchId;
      }

      await PerformanceStat.findOneAndUpdate(
        queryUser,
        update,
        { upsert: true }
      );
      await PerformanceStat.findOneAndUpdate(
        queryProject,
        update,
        { upsert: true }
      );
    }
  }

  /**
   * Record standalone focus session time
   */
  async recordFocusTime(userId, durationMinutes, date, branchId) {
    const hours = Number((durationMinutes / 60).toFixed(2));
    const periods = ["daily", "weekly", "monthly", "yearly"];
    for (const period of periods) {
      const normalizedDate = this._normalizeDate(date, period);
      const query = { entityType: "user", entityId: userId, period, date: normalizedDate };
      if (branchId) {
          query.branchId = branchId;
      }
      await PerformanceStat.findOneAndUpdate(
        query,
        { $inc: { "metrics.hoursLogged": hours } },
        { upsert: true }
      );
    }
  }

  /**
   * Remove standalone focus session time (for deletions)
   */
  async removeFocusTime(userId, durationMinutes, date, branchId) {
    const hours = Number((durationMinutes / 60).toFixed(2));
    const periods = ["daily", "weekly", "monthly", "yearly"];
    for (const period of periods) {
      const normalizedDate = this._normalizeDate(date, period);
      const query = { entityType: "user", entityId: userId, period, date: normalizedDate };
      if (branchId) {
          query.branchId = branchId;
      }
      await PerformanceStat.findOneAndUpdate(
        query,
        { $inc: { "metrics.hoursLogged": -hours } },
        { upsert: true }
      );
    }
  }

  /**
   * Helper to normalize date to the start of the period
   */
  _normalizeDate(date, period) {
    const mDate = moment(date);
    if (period === "daily") return mDate.startOf("day").toDate();
    if (period === "weekly") return mDate.startOf("isoWeek").toDate();
    if (period === "monthly") return mDate.startOf("month").toDate();
    if (period === "yearly") return mDate.startOf("year").toDate();
    return date;
  }
}

export default new AnalyticsService();
