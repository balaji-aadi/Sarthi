import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Task } from "../../models/task.model.js";
import { Project } from "../../models/project.model.js";
import { Sprint } from "../../models/sprint.model.js";
import { DailyRevision } from "../../models/dailyRevision.model.js";
import { FocusSession } from "../../models/focusSession.model.js";
import { UserTaskProgress } from "../../models/userTaskProgress.model.js";
import mongoose from "mongoose";
import { calculateStatusDuration } from "../../utils/calculateStatusDuration.js";
import { Notification } from "../../models/notification.model.js";
import notificationService from "../notification-service/notification.service.js";
import { socketService } from "../../socket-instance.js";
import { ProgressService } from "../progress-service/progress.service.js";
import AnalyticsService from "../analytics-service/analytics.service.js";
import Pattern from "../../models/pattern.model.js";
import Company from "../../models/company.model.js";
import axios from "axios";
import { calculateRevisionQueue, getLearnerLocalDateStr } from "../revision-service/revisionScheduler.js";
import { analyzePatternWeaknesses } from "../revision-service/patternAnalyzer.js";

const checkIsAdmin = (user) => {
  return (
    user?.email === "balajiaadi2000@gmail.com" ||
    user?.userRole?.name?.toLowerCase() === "admin" ||
    user?.role === "admin" ||
    (user?.userRoles && user.userRoles.some(r => r.name?.toLowerCase() === "admin"))
  );
};

/**
 * Projects individual user execution state from UserTaskProgress onto canonical master tasks.
 * For Admin: Preserves Admin's historical task completion, progress, and logs directly from Task model if no UserTaskProgress exists.
 * For Non-Admin: If no UserTaskProgress record exists, clean defaults are applied: status = 'todo', progress = 0, dates = null, logs = [].
 */
const projectUserTaskProgress = async (tasks, userId, user = null) => {
  if (!tasks || tasks.length === 0) return [];

  const isAdmin = user ? checkIsAdmin(user) : (userId?.toString() === "6993047f16e85ff3e4efd9a3");

  const taskIds = tasks.map(t => t._id);
  tasks.forEach(t => {
    if (t.parentTask) {
      const pid = typeof t.parentTask === "object" ? (t.parentTask._id || t.parentTask.id) : t.parentTask;
      if (pid) taskIds.push(pid);
    }
  });

  const userProgressList = await UserTaskProgress.find({
    userId: new mongoose.Types.ObjectId(userId),
    taskId: { $in: taskIds }
  }).lean();

  const progressMap = new Map(
    userProgressList.map(p => [p.taskId.toString(), p])
  );

  const projectedList = tasks.map(task => {
    const taskObj = task.toObject ? task.toObject() : { ...task };
    const userProgress = progressMap.get(taskObj._id.toString());

    if (userProgress) {
      taskObj.status = userProgress.status || "todo";
      taskObj.progress = userProgress.progress ?? (userProgress.status === "done" ? 100 : 0);
      taskObj.taskStartDate = userProgress.taskStartDate || taskObj.taskStartDate || null;
      taskObj.taskDueDate = userProgress.taskDueDate || taskObj.taskDueDate || null;
      taskObj.holdDate = userProgress.holdDate || null;
      taskObj.completedAt = userProgress.completedAt || null;
      taskObj.activityLogs = userProgress.activityLogs || [];
      taskObj.revisionLogs = userProgress.revisionLogs || [];
      taskObj.solveHistory = userProgress.solveHistory || [];
      taskObj.latestOutcome = userProgress.latestOutcome || null;
      taskObj.latestConfidence = userProgress.latestConfidence || null;
    } else if (isAdmin) {
      // For Admin: preserve Admin's historical task status, progress, dates, and logs directly from Task model
      taskObj.status = taskObj.status || "todo";
      taskObj.progress = taskObj.progress ?? (taskObj.status === "done" ? 100 : 0);
      taskObj.taskStartDate = taskObj.taskStartDate || null;
      taskObj.taskDueDate = taskObj.taskDueDate || null;
      taskObj.holdDate = taskObj.holdDate || null;
      taskObj.completedAt = taskObj.completedAt || null;
      taskObj.activityLogs = taskObj.activityLogs || [];
      taskObj.revisionLogs = taskObj.revisionLogs || [];
      taskObj.solveHistory = [];
      taskObj.latestOutcome = null;
      taskObj.latestConfidence = null;
    } else {
      // For Non-Admin: fresh, clean execution state for status/progress, BUT keep canonical dates from master Task
      taskObj.status = "todo";
      taskObj.progress = 0;
      taskObj.taskStartDate = taskObj.taskStartDate || null;
      taskObj.taskDueDate = taskObj.taskDueDate || null;
      taskObj.holdDate = null;
      taskObj.completedAt = null;
      taskObj.activityLogs = [];
      taskObj.revisionLogs = [];
      taskObj.solveHistory = [];
      taskObj.latestOutcome = null;
      taskObj.latestConfidence = null;
    }

    // Also overlay user execution state on populated parentTask sub-document if present
    if (taskObj.parentTask && typeof taskObj.parentTask === "object") {
      const parentId = (taskObj.parentTask._id || taskObj.parentTask.id)?.toString();
      if (parentId) {
        const parentProgress = progressMap.get(parentId);
        if (parentProgress) {
          taskObj.parentTask = {
            ...taskObj.parentTask,
            status: parentProgress.status || "todo",
            taskStartDate: parentProgress.taskStartDate || taskObj.parentTask.taskStartDate || null,
            taskDueDate: parentProgress.taskDueDate || taskObj.parentTask.taskDueDate || null,
            holdDate: parentProgress.holdDate || null
          };
        } else if (isAdmin) {
          taskObj.parentTask = {
            ...taskObj.parentTask,
            status: taskObj.parentTask.status || "todo",
            taskStartDate: taskObj.parentTask.taskStartDate || null,
            taskDueDate: taskObj.parentTask.taskDueDate || null,
            holdDate: taskObj.parentTask.holdDate || null
          };
        } else {
          taskObj.parentTask = {
            ...taskObj.parentTask,
            status: "todo",
            taskStartDate: taskObj.parentTask.taskStartDate || null,
            taskDueDate: taskObj.parentTask.taskDueDate || null,
            holdDate: null
          };
        }
      }
    }

    // Pre-calculate status duration based on user's activity logs
    taskObj.duration = calculateStatusDuration(taskObj.activityLogs || []);
    return taskObj;
  });

  // Dynamically calculate user-scoped subtaskStats & progress for Parent Topics
  const childrenByParent = new Map();
  projectedList.forEach(t => {
    if (t.parentTask) {
      const pid = (typeof t.parentTask === "object" ? (t.parentTask._id || t.parentTask.id) : t.parentTask)?.toString();
      if (pid) {
        if (!childrenByParent.has(pid)) {
          childrenByParent.set(pid, []);
        }
        childrenByParent.get(pid).push(t);
      }
    }
  });

  return projectedList.map(taskObj => {
    const taskIdStr = taskObj._id.toString();
    if (childrenByParent.has(taskIdStr)) {
      const children = childrenByParent.get(taskIdStr);
      const total = children.length;
      const completed = children.filter(c => c.status === "done").length;
      taskObj.subtaskStats = { total, completed };
      taskObj.progress = total > 0 ? Math.round((completed / total) * 100) : (taskObj.progress || 0);
      if (completed === total && total > 0) {
        taskObj.status = "done";
      }
    } else if (!taskObj.parentTask) {
      taskObj.subtaskStats = { total: 0, completed: 0 };
    } else {
      taskObj.subtaskStats = { total: 0, completed: 0 };
    }
    return taskObj;
  });
};

export function sanitizeCompanyTags(companyTags) {
  if (!companyTags) return [];
  if (!Array.isArray(companyTags)) {
    throw new ApiError(400, "companyTags must be an array.");
  }
  const seenCompanies = new Set();
  const sanitized = [];

  for (const tag of companyTags) {
    if (!tag) continue;
    const companyId = tag.company?._id || tag.company || tag;
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      throw new ApiError(400, "Invalid company ID provided in company tags.");
    }
    const compStr = companyId.toString();
    if (seenCompanies.has(compStr)) {
      throw new ApiError(400, "Duplicate company tag detected: a question can only have one tag per company.");
    }
    seenCompanies.add(compStr);

    sanitized.push({
      company: new mongoose.Types.ObjectId(compStr)
    });
  }

  return sanitized;
}

const tc = {};

// create Task
tc.createTask = asyncHandler(async (req, res) => {
  console.log("req.body", req.body)
  try {
    const {
      projectName,
      taskName,
      taskPriority,
      taskType,
      taskStartDate,
      taskDueDate,
      assignee,
      taskDescription,
      estimatedHours,
      storyPoints,
      epic,
      sprint,
      milestone,
      dependentTasks,
      attachments,
      additionalNotes,
      youtubeUrl,
      status,
      progress,
      parentTask,
      difficulty,
      leetcodeUrl,
      isUrlVerified,
      patternRef,
      companyTags,
    } = req.body;

    const requiredFields = {
      // projectName, // Made optional
      taskName,
      taskPriority,
      taskType,
      // taskStartDate, // Made optional
      // taskDueDate, // Made optional
      // assignee, // Made optional
      // estimatedHours,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (field) => !requiredFields[field] || requiredFields[field] === "undefined"
    );

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `Missing required field: ${missingFields.join(", ")}`
          )
        );
    }

    // Data Integrity: Check Parent Task Project
    if (parentTask) {
      const parent = await Task.findById(parentTask);
      if (!parent) {
        return res.status(400).json(new ApiError(400, "Parent Task not found"));
      }
      // Ensure subtask belongs to same project (handling ObjectId comparison)
      if (projectName && parent.projectName && parent.projectName.toString() !== projectName.toString()) {
        return res.status(400).json(new ApiError(400, "Subtask must belong to the same project as Parent Task"));
      }
    }

    // Generate Readable Task ID (e.g., MOM-101)
    let taskId = null;
    if (projectName) {
      const project = await Project.findById(projectName);
      if (project && project.key) {
        const lastTask = await Task.findOne({ projectName }).sort({ createdAt: -1 });
        let nextNum = 1;
        if (lastTask && lastTask.taskId) {
          const parts = lastTask.taskId.split('-');
          const lastNum = parseInt(parts[parts.length - 1]);
          if (!isNaN(lastNum)) nextNum = lastNum + 1;
        } else {
          // Fallback/Init: Count existing tasks to be safe or start at 1
          const count = await Task.countDocuments({ projectName });
          nextNum = count + 1;
        }
        taskId = `${project.key}-${nextNum}`;
      }
    }

    // Date Validation for Subtasks
    if (parentTask) {
      const parent = await Task.findById(parentTask);
      if (parent) {
        const start = new Date(taskStartDate);
        const due = new Date(taskDueDate);
        const pStart = parent.taskStartDate ? new Date(parent.taskStartDate) : null;
        const pDue = parent.taskDueDate ? new Date(parent.taskDueDate) : null;

        if (pStart && start < pStart) {
          return res.status(400).json(new ApiError(400, `Subtask start date (${start.toLocaleDateString()}) cannot be before parent task start date (${pStart.toLocaleDateString()})`));
        }
        if (pDue && due > pDue) {
          return res.status(400).json(new ApiError(400, `Subtask due date (${due.toLocaleDateString()}) cannot be after parent task due date (${pDue.toLocaleDateString()})`));
        }
      }
    }

    const createdTask = await Task.create({
      projectName: projectName || undefined,
      taskName,
      taskId,
      taskPriority,
      taskType,
      taskStartDate,
      taskDueDate,
      assignee: assignee || null,
      taskDescription,
      estimatedHours,
      storyPoints,
      epic,
      sprint,
      dependentTasks,
      additionalNotes,
      youtubeUrl,
      attachments,
      milestone: milestone || null,
      status,
      progress: progress || 0,
      createdBy: req.user?._id,
      parentTask: parentTask || null,
      difficulty: difficulty || null,
      leetcodeUrl: typeof leetcodeUrl === "string" ? leetcodeUrl.trim() : "",
      isUrlVerified: Boolean(isUrlVerified),
      patternRef: patternRef || null,
      companyTags: req.body.companyTags ? sanitizeCompanyTags(req.body.companyTags) : [],
      branchId: req.branchId ? new mongoose.Types.ObjectId(req.branchId) : undefined,
      activityLogs: [
        {
          oldStatus: null,
          currentStatus: status,
          user: req.user?._id,
          date: new Date(),
          message: `Task created with status Todo`,
        },
      ],
    });

    await Notification.create({
      senderId: req.user?._id,
      receiverId: new mongoose.Types.ObjectId(assignee),
      title: "Task created for you",
      message: taskName,
      projectId: new mongoose.Types.ObjectId(projectName),
    });

    const message = { title: "Task created for you", body: taskName };

    socketService._io.emit("notification", message, assignee);
    await notificationService(new mongoose.Types.ObjectId(assignee), message);

    if (createdTask.parentTask) await ProgressService.updateParentTaskProgress(createdTask.parentTask);
    if (createdTask.milestone) await ProgressService.updateMilestoneProgress(createdTask.milestone);
    if (createdTask.projectName) await ProgressService.updateProjectProgress(createdTask.projectName);
    if (createdTask.sprint) await ProgressService.updateSprintProgress(createdTask.sprint);

    // Update Analytics
    AnalyticsService.handleTaskUpdate(createdTask.assignee, createdTask.projectName, createdTask._id, null, createdTask.status).catch(err => console.error("Analytics Error:", err));

    return res
      .status(201)
      .json(new ApiResponse(201, createdTask, "Task created successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res.status(400).json(new ApiError(404, error, "Error"));
  }
});

// get last created Task
tc.getLastCreatedTask = asyncHandler(async (req, res) => {
  try {
    const lastTask = await Task.findOne({ createdBy: req.user?._id })
      .sort({ createdAt: -1 })
      .populate("projectName milestone sprint parentTask assignee");

    if (!lastTask) {
      return res.status(200).json(new ApiResponse(200, null, "No previous tasks found"));
    }

    return res.status(200).json(new ApiResponse(200, lastTask, "Last created task fetched successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res.status(400).json(new ApiError(400, "Error fetching last created task"));
  }
});


//update Task
tc.updateTask = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!taskId || taskId === "undefined") {
      return res.status(400).json(new ApiError(400, "Task ID not provided"));
    }

    const userId = req.user._id;
    const isAdmin = req.user?.email === "balajiaadi2000@gmail.com" ||
      req.user?.userRole?.name?.toLowerCase() === "admin" ||
      req.user?.role === "admin";

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }

    const curriculumFields = [
      "taskName", "taskPriority", "taskType", "assignee", "taskDescription",
      "attachments", "estimatedHours", "backlogEstimatedHours", "storyPoints",
      "epic", "sprint", "milestone", "dependentTasks", "parentTask",
      "additionalNotes", "youtubeUrl", "projectName",
      "difficulty", "leetcodeUrl", "isUrlVerified", "patternRef", "companyTags"
    ];

    const executionFields = [
      "status", "progress", "taskStartDate", "taskDueDate", "holdDate"
    ];

    const incomingKeys = Object.keys(req.body).filter(k => req.body[k] !== undefined);
    const hasCurriculum = incomingKeys.some(k => curriculumFields.includes(k));
    const hasExecution = incomingKeys.some(k => executionFields.includes(k));

    // Guard: Non-admin users cannot mutate curriculum metadata
    if (hasCurriculum && !isAdmin) {
      return res.status(403).json(new ApiError(403, "Forbidden: Only administrators can modify master curriculum content."));
    }

    // 1. If Admin updates Master Curriculum fields
    if (hasCurriculum && isAdmin) {
      const curriculumUpdates = {};
      curriculumFields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === "companyTags") {
            curriculumUpdates.companyTags = sanitizeCompanyTags(req.body.companyTags);
          } else {
            curriculumUpdates[field] = req.body[field];
          }
        }
      });
      curriculumUpdates.updatedBy = userId;

      await Task.findByIdAndUpdate(taskId, curriculumUpdates, { new: true });
    }

    // 2. User Execution updates (applies to both regular users and Admin's personal learning)
    let userProgress = await UserTaskProgress.findOne({ userId, taskId: existingTask._id });
    if (!userProgress) {
      userProgress = new UserTaskProgress({
        userId,
        taskId: existingTask._id,
        projectName: existingTask.projectName,
        branchId: existingTask.branchId || (req.branchId ? new mongoose.Types.ObjectId(req.branchId) : undefined),
        status: "todo",
        progress: 0,
        taskStartDate: existingTask.taskStartDate || null,
        taskDueDate: existingTask.taskDueDate || null,
        activityLogs: []
      });
    }

    if (hasExecution) {
      const { status, progress, taskStartDate, taskDueDate, holdDate } = req.body;
      const oldStatus = userProgress.status || "todo";

      if (status !== undefined) {
        // Status Restriction: Parent task cannot be 'done' if user has pending subtasks
        if (status === "done") {
          const childTasks = await Task.find({ parentTask: existingTask._id }).select("_id");
          if (childTasks.length > 0) {
            const childIds = childTasks.map(c => c._id);
            const doneCount = await UserTaskProgress.countDocuments({
              userId,
              taskId: { $in: childIds },
              status: "done"
            });
            if (doneCount < childTasks.length) {
              return res.status(400).json(new ApiError(400, "Cannot complete task while subtasks are still pending."));
            }
          }
        }

        if (status === "todo") {
          const wasCompleted = userProgress.status === "done" || 
            Boolean(userProgress.completedAt) || 
            (Array.isArray(userProgress.solveHistory) && userProgress.solveHistory.some(s => s.outcome && s.outcome !== "UNSOLVED"));
          if (wasCompleted) {
            return res.status(400).json(new ApiError(400, "Completed problems cannot be reverted to To Do. Use Solve Again to re-attempt."));
          }
        }

        userProgress.status = status;
        if (status === "done") {
          userProgress.progress = 100;
          userProgress.completedAt = new Date();
        } else if (status === "todo") {
          userProgress.progress = 0;
          userProgress.completedAt = null;
        }

        if (status === "hold") {
          userProgress.holdDate = holdDate ? new Date(holdDate) : new Date();
        } else if (oldStatus === "hold") {
          userProgress.holdDate = null;
        }

        if (oldStatus !== status) {
          userProgress.activityLogs.unshift({
            oldStatus,
            currentStatus: status,
            date: new Date(),
            message: `Task updated from ${oldStatus} >>> ${status}`
          });
        }
      }

      if (progress !== undefined && status !== "done") {
        userProgress.progress = progress;
      }
      if (taskStartDate !== undefined) {
        userProgress.taskStartDate = taskStartDate ? new Date(taskStartDate) : null;
      }
      if (taskDueDate !== undefined) {
        userProgress.taskDueDate = taskDueDate ? new Date(taskDueDate) : null;
      }

      await userProgress.save();

      // Cascade hold status to child tasks in UserTaskProgress if status changed
      if (!existingTask.parentTask && (status === "hold" || oldStatus === "hold")) {
        await handleUserHoldCascade(existingTask._id, status, oldStatus, userId, existingTask.branchId || req.branchId, existingTask.projectName);
      }
    }

    // Fetch fresh canonical master task and project user execution state
    const freshMasterTask = await Task.findById(taskId)
      .populate("projectName", "name key settings")
      .populate("assignee", "firstName lastName email")
      .populate("milestone", "milestoneName")
      .populate("epic", "epicName")
      .populate("sprint", "sprintName startDate endDate")
      .populate("parentTask", "taskName taskId status taskStartDate taskDueDate holdDate");

    const projectedTask = {
      ...freshMasterTask.toObject(),
      status: userProgress.status,
      progress: userProgress.progress,
      taskStartDate: userProgress.taskStartDate || freshMasterTask.taskStartDate || null,
      taskDueDate: userProgress.taskDueDate || freshMasterTask.taskDueDate || null,
      holdDate: userProgress.holdDate,
      completedAt: userProgress.completedAt,
      activityLogs: userProgress.activityLogs || [],
      revisionLogs: userProgress.revisionLogs || [],
      duration: calculateStatusDuration(userProgress.activityLogs || [])
    };

    return res.status(200).json(new ApiResponse(200, projectedTask, "Task updated successfully"));
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json(new ApiError(500, error.message || "Internal server error"));
  }
});


// get task by id
tc.getTaskById = asyncHandler(async (req, res) => {
  try {
    if (!req.params.taskId || req.params.taskId === "undefined") {
      return res.status(400).json(new ApiError(400, "Task ID not provided"));
    }

    const userId = req.user._id;
    const task = await Task.findById(req.params.taskId)
      .populate("projectName assignee milestone epic sprint parentTask")
      .populate("patternRef", "name slug")
      .populate("companyTags.company", "name slug logoUrl");

    if (!task) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }

    // Verify branch authorization if branch header is present
    if (req.branchId) {
      const isSuperAdmin = req.user?.email === "balajiaadi2000@gmail.com";
      const taskBranchId = task.branchId ? task.branchId.toString() : null;
      const projectBranchId = task.projectName?.branchId ? task.projectName.branchId.toString() : null;

      let isBranchAuthorized = (taskBranchId === req.branchId.toString()) || (projectBranchId === req.branchId.toString());
      if (!isBranchAuthorized && task.projectName) {
        const pId = task.projectName._id || task.projectName;
        const project = await Project.findOne({ _id: pId, branchId: req.branchId }).select("_id").lean();
        if (project) isBranchAuthorized = true;
      }

      if (!isBranchAuthorized && !isSuperAdmin) {
        return res.status(403).json(new ApiError(403, "Access denied: Task does not belong to the active branch"));
      }
    }

    const userProgress = await UserTaskProgress.findOne({ userId, taskId: task._id }).lean();
    const isAdmin = checkIsAdmin(req.user);

    const taskObj = task.toObject();
    if (userProgress) {
      taskObj.status = userProgress.status || "todo";
      taskObj.progress = userProgress.progress ?? (userProgress.status === "done" ? 100 : 0);
      taskObj.taskStartDate = userProgress.taskStartDate || taskObj.taskStartDate || null;
      taskObj.taskDueDate = userProgress.taskDueDate || taskObj.taskDueDate || null;
      taskObj.holdDate = userProgress.holdDate || null;
      taskObj.completedAt = userProgress.completedAt || null;
      taskObj.activityLogs = userProgress.activityLogs || [];
      taskObj.revisionLogs = userProgress.revisionLogs || [];
      taskObj.solveHistory = userProgress.solveHistory || [];
      taskObj.latestOutcome = userProgress.latestOutcome || null;
      taskObj.latestConfidence = userProgress.latestConfidence || null;
    } else if (isAdmin) {
      taskObj.status = taskObj.status || "todo";
      taskObj.progress = taskObj.progress ?? (taskObj.status === "done" ? 100 : 0);
      taskObj.taskStartDate = taskObj.taskStartDate || null;
      taskObj.taskDueDate = taskObj.taskDueDate || null;
      taskObj.holdDate = taskObj.holdDate || null;
      taskObj.completedAt = taskObj.completedAt || null;
      taskObj.activityLogs = taskObj.activityLogs || [];
      taskObj.revisionLogs = taskObj.revisionLogs || [];
      taskObj.solveHistory = [];
      taskObj.latestOutcome = null;
      taskObj.latestConfidence = null;
    } else {
      taskObj.status = "todo";
      taskObj.progress = 0;
      taskObj.taskStartDate = taskObj.taskStartDate || null;
      taskObj.taskDueDate = taskObj.taskDueDate || null;
      taskObj.holdDate = null;
      taskObj.completedAt = null;
      taskObj.activityLogs = [];
      taskObj.revisionLogs = [];
      taskObj.solveHistory = [];
      taskObj.latestOutcome = null;
      taskObj.latestConfidence = null;
    }

    // Overlay user execution state on populated parentTask if present
    if (taskObj.parentTask && typeof taskObj.parentTask === "object") {
      const parentId = (taskObj.parentTask._id || taskObj.parentTask.id)?.toString();
      if (parentId) {
        const parentProgress = await UserTaskProgress.findOne({ userId, taskId: parentId }).lean();
        if (parentProgress) {
          taskObj.parentTask = {
            ...taskObj.parentTask,
            status: parentProgress.status || "todo",
            taskStartDate: parentProgress.taskStartDate || taskObj.parentTask.taskStartDate || null,
            taskDueDate: parentProgress.taskDueDate || taskObj.parentTask.taskDueDate || null,
            holdDate: parentProgress.holdDate || null
          };
        } else if (isAdmin) {
          taskObj.parentTask = {
            ...taskObj.parentTask,
            status: taskObj.parentTask.status || "todo",
            taskStartDate: taskObj.parentTask.taskStartDate || null,
            taskDueDate: taskObj.parentTask.taskDueDate || null,
            holdDate: taskObj.parentTask.holdDate || null
          };
        } else {
          taskObj.parentTask = {
            ...taskObj.parentTask,
            status: "todo",
            taskStartDate: taskObj.parentTask.taskStartDate || null,
            taskDueDate: taskObj.parentTask.taskDueDate || null,
            holdDate: null
          };
        }
      }
    }

    // Dynamically calculate user-scoped subtaskStats & progress for Parent Topics
    if (!taskObj.parentTask) {
      const childTasks = await Task.find({ parentTask: taskObj._id }).select("_id status").lean();
      const childIds = childTasks.map(c => c._id);
      const total = childIds.length;
      let completed = 0;
      if (total > 0) {
        if (isAdmin) {
          const doneProgress = await UserTaskProgress.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            taskId: { $in: childIds },
            status: "done"
          });
          const doneTasks = childTasks.filter(c => c.status === "done").length;
          completed = Math.max(doneProgress, doneTasks);
        } else {
          completed = await UserTaskProgress.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            taskId: { $in: childIds },
            status: "done"
          });
        }
      }
      taskObj.subtaskStats = { total, completed };
      taskObj.progress = total > 0 ? Math.round((completed / total) * 100) : (taskObj.progress || 0);
      if (completed === total && total > 0) {
        taskObj.status = "done";
      }
    } else {
      taskObj.subtaskStats = { total: 0, completed: 0 };
    }

    taskObj.duration = calculateStatusDuration(taskObj.activityLogs || []);

    return res.status(200).json(
      new ApiResponse(200, taskObj, "Task fetched successfully")
    );
  } catch (error) {
    console.error("Error in getTaskById:", error);
    return res.status(500).json(new ApiError(500, error.message || "Error fetching task"));
  }
});


import { checkAndTransitionTasks } from "./taskTransition.job.js";

// get all tasks
tc.getallTasks = asyncHandler(async (req, res) => {
  try {
    const { search = "" } = req.query;
    let { filter = {}, sortOrder = -1 } = req.body;
    const userId = req.user._id;

    // Normalize target project filter
    const targetProjectId = filter?.projectName || filter?.projectId;
    if (targetProjectId) {
      if (req.branchId) {
        // Verify project belongs to active branch
        const isSuperAdmin = req.user?.email === "balajiaadi2000@gmail.com";
        const project = await Project.findOne({ _id: targetProjectId, branchId: req.branchId }).select("_id").lean();
        if (!project && !isSuperAdmin) {
          return res.status(403).json(new ApiError(403, "Access denied: Project does not belong to the active branch"));
        }
      }
      filter.projectName = new mongoose.Types.ObjectId(targetProjectId);
      delete filter.projectId;
      delete filter.branchId;
    } else if (req.branchId) {
      // Cross-project query in active branch: match tasks with explicit branchId OR projects belonging to this branch
      const branchProjects = await Project.find({ branchId: req.branchId }).select("_id").lean();
      const branchProjectIds = branchProjects.map(p => p._id);
      filter.$or = [
        { branchId: new mongoose.Types.ObjectId(req.branchId) },
        { projectName: { $in: branchProjectIds } }
      ];
      delete filter.branchId;
    }

    let searchCondition = {};
    if (search && search !== "undefined") {
      const regex = new RegExp(search, "i");
      searchCondition.$or = [
        { taskName: { $regex: regex } },
        { taskPriority: { $regex: regex } },
        { taskType: { $regex: regex } },
        { taskDescription: { $regex: regex } },
        { additionalNotes: { $regex: regex } },
      ];
    }

    if (filter.milestone) {
      filter.milestone = new mongoose.Types.ObjectId(filter.milestone);
    }

    if (filter.sprint) {
      filter.sprint = new mongoose.Types.ObjectId(filter.sprint);
    }

    if (filter.epic) {
      filter.epic = new mongoose.Types.ObjectId(filter.epic);
    }

    if (filter.parentTask) {
      filter.parentTask = new mongoose.Types.ObjectId(filter.parentTask);
    }

    if (req.query.company || filter.company) {
      const compId = req.query.company || filter.company;
      if (mongoose.Types.ObjectId.isValid(compId)) {
        filter["companyTags.company"] = new mongoose.Types.ObjectId(compId);
      }
      delete filter.company;
    }

    const requestedStatus = filter?.status;
    const requestedType = filter?.type;
    delete filter.status;
    delete filter.type;

    const tasks = await Task.find({ ...searchCondition, ...filter })
      .populate("projectName", "name key settings")
      .populate("assignee", "firstName lastName email")
      .populate("milestone", "milestoneName")
      .populate("epic", "epicName")
      .populate("sprint", "sprintName startDate endDate")
      .populate("parentTask", "taskName taskId status taskStartDate taskDueDate holdDate")
      .populate("patternRef", "name slug")
      .populate("companyTags.company", "name slug logoUrl")
      .populate({
        path: "createdBy",
        select: "firstName lastName email"
      })
      .sort({ _id: sortOrder })
      .lean();

    // Dynamically project user-specific execution state from UserTaskProgress
    const projectedTasks = await projectUserTaskProgress(tasks, userId, req.user);

    // Apply user-level status or type filter if requested
    let finalTasks = projectedTasks;
    if (requestedStatus) {
      finalTasks = finalTasks.filter(t => t.status === requestedStatus);
    }
    if (requestedType === "open") {
      finalTasks = finalTasks.filter(t => ["todo", "inprogress"].includes(t.status));
    } else if (requestedType === "hold") {
      finalTasks = finalTasks.filter(t => t.status === "hold");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, finalTasks, "Tasks fetched successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res
      .status(400)
      .json(new ApiError(400, error.message || "Error fetching tasks"));
  }
});


// delete task
tc.deleteTask = asyncHandler(async (req, res) => {
  try {
    if (req.params.taskId == "undefined" || !req.params.taskId) {
      return res.status(400).json(new ApiError(400, "id not provided"));
    }

    const task = await Task.findOneAndDelete({ _id: req.params.taskId, branchId: req.branchId });

    if (!task) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }

    // Update Analytics
    AnalyticsService.handleTaskDeletion(task).catch(err => console.error("Analytics Deletion Error:", err));

    // Update Cascading Progress
    if (task.parentTask) await ProgressService.updateParentTaskProgress(task.parentTask);
    if (task.milestone) await ProgressService.updateMilestoneProgress(task.milestone);
    if (task.projectName) await ProgressService.updateProjectProgress(task.projectName);
    if (task.sprint) await ProgressService.updateSprintProgress(task.sprint);

    return res
      .status(200)
      .json(new ApiResponse(200, task, "Task deleted successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res.status(400).json(new ApiError(404, error, "Error"));
  }
});


const handleHoldCascade = async (parentTask, newStatus, oldStatus, userId) => {
  // If it's a top-level parent task
  if (!parentTask.parentTask) {
    const childTasks = await Task.find({ parentTask: parentTask._id });
    for (const child of childTasks) {
      let userChildProgress = await UserTaskProgress.findOne({ userId, taskId: child._id });
      const childStatus = userChildProgress?.status || "todo";

      if (newStatus === "hold" && childStatus !== "hold" && childStatus !== "done") {
        if (!userChildProgress) {
          userChildProgress = new UserTaskProgress({
            userId,
            taskId: child._id,
            projectName: child.projectName,
            branchId: child.branchId,
            status: "hold",
            holdDate: new Date(),
            activityLogs: []
          });
        } else {
          userChildProgress.status = "hold";
          userChildProgress.holdDate = new Date();
        }
        userChildProgress.activityLogs.unshift({
          oldStatus: childStatus,
          currentStatus: "hold",
          date: new Date(),
          message: `Status had been changed from ${childStatus} >>> hold (inherited from parent task hold)`
        });
        await userChildProgress.save();
        AnalyticsService.handleTaskUpdate(child.assignee, child.projectName, child._id, childStatus, "hold").catch(err => console.error("Analytics Error:", err));
      } else if (oldStatus === "hold" && newStatus !== "hold" && childStatus === "hold") {
        if (userChildProgress) {
          userChildProgress.status = "todo";
          userChildProgress.holdDate = null;
          userChildProgress.activityLogs.unshift({
            oldStatus: "hold",
            currentStatus: "todo",
            date: new Date(),
            message: `Status had been changed from hold >>> todo (released from parent task hold)`
          });
          await userChildProgress.save();
          AnalyticsService.handleTaskUpdate(child.assignee, child.projectName, child._id, "hold", "todo").catch(err => console.error("Analytics Error:", err));
        }
      }
    }
  }
};

const getParentTaskId = (parentTaskField) => {
  if (!parentTaskField) return null;
  if (typeof parentTaskField === 'string') return parentTaskField;
  if (mongoose.Types.ObjectId.isValid(parentTaskField)) return parentTaskField.toString();
  if (typeof parentTaskField === 'object') {
    if (parentTaskField._id) return parentTaskField._id.toString();
    return parentTaskField.toString();
  }
  return null;
};

const autoSyncHeldParentChildren = async (tasks, userId) => {
  // 1. Find all parent tasks in the fetched list that are on 'hold'
  const heldParentIds = tasks
    .filter(t => !t.parentTask && t.status === 'hold')
    .map(t => t._id.toString());

  if (heldParentIds.length === 0) return tasks;

  // 2. Loop through all fetched tasks and sync child tasks in UserTaskProgress
  for (let task of tasks) {
    const pIdStr = getParentTaskId(task.parentTask);
    if (pIdStr && heldParentIds.includes(pIdStr)) {
      if (task.status !== 'hold' && task.status !== 'done') {
        let userProgress = await UserTaskProgress.findOne({ userId, taskId: task._id });
        if (!userProgress) {
          userProgress = new UserTaskProgress({
            userId,
            taskId: task._id,
            projectName: task.projectName?._id || task.projectName,
            branchId: task.branchId,
            status: "hold",
            holdDate: new Date(),
            activityLogs: []
          });
        } else {
          userProgress.status = "hold";
          userProgress.holdDate = new Date();
        }
        userProgress.activityLogs.unshift({
          oldStatus: task.status,
          currentStatus: "hold",
          date: new Date(),
          message: "Status automatically synced to hold because parent task is on hold"
        });
        await userProgress.save();

        task.status = "hold";
        task.holdDate = userProgress.holdDate;
        AnalyticsService.handleTaskUpdate(task.assignee, task.projectName, task._id, task.status, "hold").catch(err => console.error("Analytics Error:", err));
      }
    }
  }

  return tasks;
};

//update Task status
tc.updatetaskLog = asyncHandler(async (req, res) => {
  console.log("Req.body", req.body);

  try {
    const { taskId } = req.params;
    const { status, taskStartDate, taskDueDate, holdDate } = req.body;
    const userId = req.user._id;

    if (!taskId) {
      return res.status(400).json(new ApiError(400, "Task ID not provided"));
    }

    if (!status) {
      return res.status(400).json(new ApiError(400, "Status not provided"));
    }

    const task = await Task.findById(taskId).populate('sprint');
    if (!task) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }

    // Restriction for Employees: Cannot change status if sprint hasn't started
    if (task.sprint && new Date() < new Date(task.sprint.startDate)) {
      const permissions = new Set();
      if (req.user?.userRole?.active && req.user?.userRole?.permissions) {
        req.user.userRole.permissions.forEach(p => p && p.name && permissions.add(p.name));
      }
      req.user?.userRoles?.forEach(role => {
        if (role.active && role.permissions) role.permissions.forEach(p => p && p.name && permissions.add(p.name));
      });

      const canBypass = permissions.has('UPDATE_TASK') || permissions.has('CREATE_SPRINT');
      if (!canBypass) {
        return res.status(400).json(new ApiError(400, "Cannot update status. The linked sprint has not started yet."));
      }
    }

    // Status Restriction: Any task cannot be 'done' if user has pending subtasks
    if (status === 'done') {
      const childTasks = await Task.find({ parentTask: task._id }).select('_id');
      if (childTasks.length > 0) {
        const childIds = childTasks.map(c => c._id);
        const doneCount = await UserTaskProgress.countDocuments({
          userId,
          taskId: { $in: childIds },
          status: 'done'
        });
        if (doneCount < childTasks.length) {
          return res.status(400).json(new ApiError(400, "Cannot complete task while subtasks are still pending."));
        }
      }
    }

    let userProgress = await UserTaskProgress.findOne({ userId, taskId: task._id });
    const oldStatus = userProgress?.status || "todo";

    if (!userProgress) {
      userProgress = new UserTaskProgress({
        userId,
        taskId: task._id,
        projectName: task.projectName,
        branchId: task.branchId || (req.branchId ? new mongoose.Types.ObjectId(req.branchId) : undefined),
        status: "todo",
        progress: 0,
        taskStartDate: task.taskStartDate || null,
        taskDueDate: task.taskDueDate || null,
        activityLogs: []
      });
    }

    userProgress.status = status;
    if (status === 'done') {
      userProgress.progress = 100;
      userProgress.completedAt = new Date();
    } else if (status === 'todo') {
      userProgress.progress = 0;
      userProgress.completedAt = null;
    }

    if (status === 'hold') {
      userProgress.holdDate = holdDate ? new Date(holdDate) : new Date();
    } else if (oldStatus === 'hold') {
      userProgress.holdDate = null;
    }

    if (taskStartDate !== undefined) userProgress.taskStartDate = taskStartDate ? new Date(taskStartDate) : null;
    if (taskDueDate !== undefined) userProgress.taskDueDate = taskDueDate ? new Date(taskDueDate) : null;

    userProgress.activityLogs.unshift({
      oldStatus,
      currentStatus: status,
      date: new Date(),
      message: `Status had been changed from ${oldStatus} >>> ${status}`,
    });

    await userProgress.save();

    // Sync status and progress to the canonical Task document
    task.status = status;
    if (status === 'done') {
      task.progress = 100;
      task.completedAt = new Date();
    } else if (status === 'todo') {
      task.progress = 0;
      task.completedAt = null;
    }
    if (taskStartDate !== undefined) task.taskStartDate = taskStartDate ? new Date(taskStartDate) : null;
    if (taskDueDate !== undefined) task.taskDueDate = taskDueDate ? new Date(taskDueDate) : null;
    if (status === 'hold') {
      task.holdDate = holdDate ? new Date(holdDate) : new Date();
    } else if (oldStatus === 'hold') {
      task.holdDate = null;
    }
    await task.save();

    // Cascade progress updates to parent task, milestone, project, and sprint
    try {
      if (task.parentTask) await ProgressService.updateParentTaskProgress(task.parentTask);
      if (task.milestone) await ProgressService.updateMilestoneProgress(task.milestone);
      if (task.projectName) await ProgressService.updateProjectProgress(task.projectName);
      if (task.sprint) await ProgressService.updateSprintProgress(task.sprint);
    } catch (progErr) {
      console.error("Error cascading progress in updatetaskLog:", progErr);
    }

    // Cascading Hold Status to children if parent is put on hold / released
    await handleHoldCascade(task, status, oldStatus, userId);

    // Update Analytics
    if (status && oldStatus !== status) {
      AnalyticsService.handleTaskUpdate(task.assignee, task.projectName, task._id, oldStatus, status).catch(err => console.error("Analytics Error:", err));
    }

    const projectedTask = {
      ...task.toObject(),
      status: userProgress.status,
      progress: userProgress.progress,
      taskStartDate: userProgress.taskStartDate || task.taskStartDate || null,
      taskDueDate: userProgress.taskDueDate || task.taskDueDate || null,
      holdDate: userProgress.holdDate,
      completedAt: userProgress.completedAt,
      activityLogs: userProgress.activityLogs || [],
      revisionLogs: userProgress.revisionLogs || [],
      duration: calculateStatusDuration(userProgress.activityLogs || [])
    };

    return res
      .status(200)
      .json(new ApiResponse(200, projectedTask, "Task status updated successfully"));
  } catch (error) {
    console.error("Error------", error);
    return res.status(400).json(new ApiError(404, "Internal server error"));
  }
});


//deletemilestone
tc.deletemilestone = asyncHandler(async (req, res) => {
  try {
    const { milestoneId } = req.params;
    console.log("milestoneId:", milestoneId);

    if (!milestoneId) {
      return res.status(400).json({
        success: false,
        message: "milestone ID not provided",
      });
    }

    const linkedTasks = await Task.find({ "milestone._id": milestoneId });

    if (linkedTasks.length > 0) {
      return res
        .status(203)
        .json(new ApiResponse(203, "This milestone can't be deleted — tasks are linked."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "This milestone can be safely deleted."));

  } catch (error) {
    console.error("Error checking milestone deletability:", error);
    return res
      .status(500)
      .json(new ApiError(500, error, "Internal Server Error"));
  }
});


//getalltaskregardless
tc.getallTasksfree = asyncHandler(async (req, res) => {
  console.log("req.body--->", req.body);

  try {
    const { search = "" } = req.query;
    let { filter = {}, sortOrder = -1 } = req.body;
    const userId = req.user._id;

    // Normalize target project filter
    const targetProjectId = filter?.projectName || filter?.projectId;
    if (targetProjectId) {
      if (req.branchId) {
        // Verify project belongs to active branch
        const isSuperAdmin = req.user?.email === "balajiaadi2000@gmail.com";
        const project = await Project.findOne({ _id: targetProjectId, branchId: req.branchId }).select("_id").lean();
        if (!project && !isSuperAdmin) {
          return res.status(403).json(new ApiError(403, "Access denied: Project does not belong to the active branch"));
        }
      }
      filter.projectName = new mongoose.Types.ObjectId(targetProjectId);
      delete filter.projectId;
      delete filter.branchId;
    } else if (req.branchId) {
      // Cross-project query in active branch: match tasks with explicit branchId OR projects belonging to this branch
      const branchProjects = await Project.find({ branchId: req.branchId }).select("_id").lean();
      const branchProjectIds = branchProjects.map(p => p._id);
      filter.$or = [
        { branchId: new mongoose.Types.ObjectId(req.branchId) },
        { projectName: { $in: branchProjectIds } }
      ];
      delete filter.branchId;
    }

    let searchCondition = {};
    if (search && search !== "undefined") {
      const regex = new RegExp(search, "i");
      searchCondition.$or = [
        { taskName: { $regex: regex } },
        { taskPriority: { $regex: regex } },
        { taskType: { $regex: regex } },
        { taskDescription: { $regex: regex } },
        { additionalNotes: { $regex: regex } },
      ];
    }

    const requestedStatus = filter?.status;
    delete filter.status;

    const tasks = await Task.find({ ...searchCondition, ...filter })
      .populate("projectName", "name key settings")
      .populate("assignee milestone activityLogs.user")
      .populate({
        path: "dependentTasks",
        populate: [
          {
            path: "createdBy",
            select: "email userRole firstName lastName"
          },
          {
            path: "assignee",
            select: "email userRole firstName lastName"
          }
        ]
      })
      .populate({
        path: "createdBy",
        select: "email userRole firstName lastName"
      })
      .sort({ _id: sortOrder })
      .lean();

    const projectedTasks = await projectUserTaskProgress(tasks, userId, req.user);

    let finalTasks = projectedTasks;
    if (requestedStatus) {
      finalTasks = finalTasks.filter(t => t.status === requestedStatus);
    }

    if (finalTasks.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "No tasks found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, finalTasks, "Tasks fetched successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res
      .status(400)
      .json(new ApiError(400, error.message || "Error fetching tasks"));
  }
});

// Record Solve Reflection (Append-only learning loop)
tc.recordReflection = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  if (!taskId) {
    return res.status(400).json(new ApiError(400, "Task ID is required"));
  }

  const {
    outcome,
    confidence,
    notes = "",
    durationMinutes = 0,
    focusSessionId = null
  } = req.body;

  const validOutcomes = [
    "SOLVED_INDEPENDENT",
    "SOLVED_WITH_HINTS",
    "SOLVED_WITH_SOLUTION",
    "UNSOLVED"
  ];
  if (!outcome || !validOutcomes.includes(outcome)) {
    return res.status(400).json(new ApiError(400, `Invalid outcome. Must be one of: ${validOutcomes.join(", ")}`));
  }

  const validConfidences = ["LOW", "MEDIUM", "HIGH"];
  if (!confidence || !validConfidences.includes(confidence)) {
    return res.status(400).json(new ApiError(400, `Invalid confidence. Must be one of: ${validConfidences.join(", ")}`));
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json(new ApiError(404, "Task not found"));
  }

  const userId = req.user._id;

  let userProgress = await UserTaskProgress.findOne({ userId, taskId: task._id });
  if (!userProgress) {
    userProgress = new UserTaskProgress({
      userId,
      taskId: task._id,
      projectName: task.projectName,
      branchId: task.branchId || (req.branchId ? new mongoose.Types.ObjectId(req.branchId) : undefined),
      status: "inprogress",
      progress: 0,
      taskStartDate: new Date(),
      activityLogs: []
    });
  }

  // Determine status transition:
  // SOLVED_* -> 'done', progress 100
  // UNSOLVED -> 'inprogress', progress 50 (NEVER move to backlog!)
  const isSolved = outcome !== "UNSOLVED";
  const oldStatus = userProgress.status || "todo";
  const newStatus = isSolved ? "done" : "inprogress";
  const newProgress = isSolved ? 100 : (userProgress.progress || 50);

  userProgress.status = newStatus;
  userProgress.progress = newProgress;
  if (isSolved) {
    userProgress.completedAt = new Date();
  }
  userProgress.latestOutcome = outcome;
  userProgress.latestConfidence = confidence;

  // Append-only reflection entry
  const attempt = {
    attemptedAt: new Date(),
    durationMinutes: Math.max(0, Math.round(Number(durationMinutes) || 0)),
    outcome,
    confidence,
    notes: String(notes || "").trim(),
    focusSessionId: focusSessionId ? new mongoose.Types.ObjectId(focusSessionId) : null
  };

  userProgress.solveHistory = userProgress.solveHistory || [];
  userProgress.solveHistory.push(attempt);

  // Phase 3 Spaced Revision: Record revision log on re-solve / reflection
  userProgress.revisionLogs = userProgress.revisionLogs || [];
  userProgress.revisionLogs.push({
    revisionDate: new Date(),
    notes: notes ? `Revision Attempt: ${outcome} (${confidence}) - ${notes}` : `Revision Attempt: ${outcome} (${confidence})`
  });

  userProgress.activityLogs.unshift({
    oldStatus,
    currentStatus: newStatus,
    date: new Date(),
    message: `Reflection logged: ${outcome} (${confidence} confidence)${notes ? ` - "${notes}"` : ""}`
  });

  await userProgress.save();

  // Phase 3: Reliably upsert today's DailyRevision for this user
  try {
    const timezoneOffset = req.body.timezoneOffset !== undefined ? parseInt(req.body.timezoneOffset) : 0;
    const localDateStr = getLearnerLocalDateStr(new Date(), timezoneOffset);
    let dailyRev = await DailyRevision.findOne({ userId, dateStr: localDateStr });
    if (!dailyRev) {
      dailyRev = await DailyRevision.create({
        userId,
        dateStr: localDateStr,
        questions: [task._id],
        completedQuestions: [task._id],
        reviseTomorrowQuestions: [],
        isStarted: true,
        isCompleted: false,
        branchId: req.branchId ? new mongoose.Types.ObjectId(req.branchId) : (task.branchId || null)
      });
    } else {
      const alreadyCompleted = (dailyRev.completedQuestions || []).some(id => id.toString() === task._id.toString());
      if (!alreadyCompleted) {
        dailyRev.completedQuestions.push(task._id);
        await dailyRev.save();
      }
    }
  } catch (err) {
    console.warn("Could not sync reflection with daily revision document:", err.message);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      userProgress,
      latestAttempt: attempt
    }, "Reflection recorded successfully")
  );
});

// Add Revision
tc.addRevision = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { notes, revisionDate, timezoneOffset, backlogStatus, reviseTomorrow } = req.body;

  if (!taskId) {
    return res.status(400).json(new ApiError(400, "Task ID is required"));
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json(new ApiError(404, "Task not found"));
  }

  const userId = req.user?._id;
  const revisionLog = {
    revisionDate: revisionDate || new Date(),
    notes: notes || "",
    revisedBy: userId
  };

  const isBacklogRetry = backlogStatus === "backlog";

  // Record revision log in user execution progress
  if (userId) {
    let userProgress = await UserTaskProgress.findOne({ userId: userId, taskId: task._id });
    if (!userProgress) {
      const targetStatus = isBacklogRetry ? "backlog" : "done";
      const targetProgress = isBacklogRetry ? 0 : 100;
      userProgress = new UserTaskProgress({
        userId: userId,
        taskId: task._id,
        projectName: task.projectName,
        branchId: task.branchId,
        status: targetStatus,
        progress: targetProgress,
        completedAt: isBacklogRetry ? null : new Date(),
        revisionLogs: [revisionLog],
        activityLogs: [{
          oldStatus: "todo",
          currentStatus: targetStatus,
          date: new Date(),
          message: isBacklogRetry ? "Backlog reviewed & kept for tomorrow" : "Task completed via Daily Revision Protocol"
        }]
      });
      await userProgress.save();
    } else {
      userProgress.revisionLogs.push(revisionLog);
      if (!isBacklogRetry && userProgress.status !== "done") {
        const oldStatus = userProgress.status;
        userProgress.status = "done";
        userProgress.progress = 100;
        userProgress.completedAt = new Date();
        userProgress.activityLogs.unshift({
          oldStatus: oldStatus,
          currentStatus: "done",
          date: new Date(),
          message: `Task completed via Daily Revision Protocol (${oldStatus} >>> done)`
        });
      } else if (isBacklogRetry && userProgress.status !== "backlog") {
        const oldStatus = userProgress.status;
        userProgress.status = "backlog";
        userProgress.activityLogs.unshift({
          oldStatus: oldStatus,
          currentStatus: "backlog",
          date: new Date(),
          message: `Task kept in backlog via Daily Revision Protocol (${oldStatus} >>> backlog)`
        });
      }
      await userProgress.save();
    }
  }

  // Check if this task is part of today's DailyRevision and mark it completed
  try {
    const offset = timezoneOffset !== undefined ? parseInt(timezoneOffset) : new Date().getTimezoneOffset();
    const localDateStr = getLocalDateString(new Date(), offset);
    const dailyRev = await DailyRevision.findOne({
      userId: req.user._id,
      isStarted: true,
      isCompleted: false
    });

    if (dailyRev && dailyRev.questions.some(qId => qId.toString() === task._id.toString())) {
      const completedStrList = (dailyRev.completedQuestions || []).map(q => q.toString());
      if (!completedStrList.includes(task._id.toString())) {
        // Sync remaining time if active
        if (dailyRev.timerIsActive && dailyRev.timerLastUpdated) {
          const now = Date.now();
          const lastUpdate = new Date(dailyRev.timerLastUpdated).getTime();
          const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
          if (elapsedSeconds > 0) {
            dailyRev.timeLeft = Math.max(0, dailyRev.timeLeft - elapsedSeconds);
            dailyRev.timerLastUpdated = new Date(now);
          }
        }

        const timeSpent = Math.max(60, (dailyRev.currentQuestionStartTimeLeft || 10800) - (dailyRev.timeLeft || 10800));

        // Log progress and completion in DailyRevision
        dailyRev.completedQuestions.push(task._id);

        if (!dailyRev.questionLogs) dailyRev.questionLogs = [];
        dailyRev.questionLogs.push({
          taskId: task._id,
          completedAtTimeLeft: dailyRev.timeLeft,
          timeSpent: timeSpent,
          notes: notes || "",
          backlogStatus: isBacklogRetry ? "backlog" : "done"
        });

        // If user chose "See Tomorrow" (retry backlog), automatically pin it for tomorrow's session
        if (isBacklogRetry || reviseTomorrow) {
          if (!dailyRev.reviseTomorrowQuestions) dailyRev.reviseTomorrowQuestions = [];
          const exists = dailyRev.reviseTomorrowQuestions.some(id => id.toString() === task._id.toString());
          if (!exists) {
            dailyRev.reviseTomorrowQuestions.push(task._id);
          }
        } else if (reviseTomorrow === false && dailyRev.reviseTomorrowQuestions) {
          dailyRev.reviseTomorrowQuestions = dailyRev.reviseTomorrowQuestions.filter(id => id.toString() !== task._id.toString());
        }

        dailyRev.currentQuestionStartTimeLeft = dailyRev.timeLeft;

        // Create a persistent FocusSession for the revision/backlog attempt
        const sessionDurationMins = Math.max(1, Math.round(timeSpent / 60));
        const focusSession = new FocusSession({
          user: req.user._id,
          startTime: new Date(Date.now() - timeSpent * 1000),
          endTime: new Date(),
          duration: sessionDurationMins,
          type: "Revision",
          date: new Date(),
          task: task._id,
          taskName: task.taskName,
          taskIdString: task.taskId,
          statusAtCompletion: isBacklogRetry ? "backlog" : "done",
          completionState: "completed",
          branchId: dailyRev.branchId || task.branchId || null
        });
        await focusSession.save();

        // Record analytics
        await AnalyticsService.recordFocusTime(
          req.user._id,
          sessionDurationMins,
          focusSession.date,
          dailyRev.branchId || task.branchId || null,
          task._id
        );

        // Check if all questions are completed now
        if (dailyRev.completedQuestions.length === dailyRev.questions.length) {
          dailyRev.isCompleted = true;
          dailyRev.timerIsActive = false;
          dailyRev.timerLastUpdated = null;
        }

        await dailyRev.save();
      }
    }
  } catch (err) {
    console.error("Error updating DailyRevision on addRevision:", err);
    if (err.statusCode || err.message?.includes("must revise") || err.message?.includes("order")) {
      return res.status(err.statusCode || 400).json(new ApiError(err.statusCode || 400, err.message));
    }
  }

  return res.status(200).json(new ApiResponse(200, task, "Revision logged successfully"));
});

const getLocalDateString = (date, offsetMinutes = 0) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  // Subtract timezone offset to get local time, then subtract 4 hours (240 minutes) to push day boundary to 4:00 AM
  const adjusted = new Date(d.getTime() - (offsetMinutes * 60 * 1000) - (4 * 60 * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
};

// Get Revision Stats
tc.getRevisionStats = asyncHandler(async (req, res) => {
  try {
    const timezoneOffset = req.query.timezoneOffset ? parseInt(req.query.timezoneOffset) : 0;
    const userId = req.user._id;

    const filter = {};
    if (req.branchId) {
      filter.branchId = new mongoose.Types.ObjectId(req.branchId);
    }
    if (req.user?.email !== "balajiaadi2000@gmail.com") {
      filter.createdBy = userId;
    }

    // Fetch completed subtasks
    filter.parentTask = { $ne: null };
    filter.status = "done";

    const tasks = await Task.find(filter)
      .populate("projectName", "name key settings")
      .populate("parentTask", "taskName taskId")
      .lean();

    const revisionLogsByDate = {};
    const completionDates = new Set();
    const revisionDates = new Set();
    const processedLogKeys = new Set();

    // 1. Fetch revision logs from UserTaskProgress for the authenticated user
    const userProgressFilter = {
      userId: userId,
      "revisionLogs.0": { $exists: true }
    };
    if (req.branchId) {
      userProgressFilter.branchId = new mongoose.Types.ObjectId(req.branchId);
    }

    const userProgresses = await UserTaskProgress.find(userProgressFilter)
      .populate({
        path: "taskId",
        populate: { path: "projectName", select: "name key settings" }
      })
      .lean();

    userProgresses.forEach(progress => {
      const task = progress.taskId;
      if (task && progress.revisionLogs && Array.isArray(progress.revisionLogs)) {
        progress.revisionLogs.forEach(log => {
          const revDateStr = getLocalDateString(log.revisionDate, timezoneOffset);
          if (revDateStr) {
            const logKey = `${task._id}_${new Date(log.revisionDate).getTime()}`;
            if (!processedLogKeys.has(logKey)) {
              processedLogKeys.add(logKey);
              revisionDates.add(revDateStr);
              if (!revisionLogsByDate[revDateStr]) {
                revisionLogsByDate[revDateStr] = [];
              }
              revisionLogsByDate[revDateStr].push({
                taskId: task._id,
                taskName: task.taskName,
                taskKey: task.taskId,
                projectName: task.projectName?.name || task.projectName,
                projectKey: task.projectName?.key || 'MOM',
                notes: log.notes,
                revisionDate: log.revisionDate,
                revisedBy: userId
              });
            }
          }
        });
      }
    });

    // 2. Also check Task model revisionLogs for legacy/admin logs
    tasks.forEach(task => {
      let completionDate = null;
      if (task.activityLogs && Array.isArray(task.activityLogs)) {
        const doneLog = [...task.activityLogs]
          .reverse()
          .find(log => log.currentStatus === 'done');
        if (doneLog) {
          completionDate = doneLog.date;
        }
      }
      if (!completionDate) {
        completionDate = task.updatedAt || task.createdAt;
      }

      const compDateStr = getLocalDateString(completionDate, timezoneOffset);
      if (compDateStr) {
        completionDates.add(compDateStr);
      }

      if (task.revisionLogs && Array.isArray(task.revisionLogs)) {
        task.revisionLogs.forEach(log => {
          const revDateStr = getLocalDateString(log.revisionDate, timezoneOffset);
          if (revDateStr) {
            const logKey = `${task._id}_${new Date(log.revisionDate).getTime()}`;
            if (!processedLogKeys.has(logKey)) {
              processedLogKeys.add(logKey);
              revisionDates.add(revDateStr);
              if (!revisionLogsByDate[revDateStr]) {
                revisionLogsByDate[revDateStr] = [];
              }
              revisionLogsByDate[revDateStr].push({
                taskId: task._id,
                taskName: task.taskName,
                taskKey: task.taskId,
                projectName: task.projectName?.name || task.projectName,
                projectKey: task.projectName?.key || 'MOM',
                notes: log.notes,
                revisionDate: log.revisionDate,
                revisedBy: log.revisedBy
              });
            }
          }
        });
      }
    });

    const streakDates = Array.from(revisionDates);

    const calculateStreak = (dates) => {
      if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

      const sorted = dates.sort((a, b) => new Date(b) - new Date(a));
      const todayStr = getLocalDateString(new Date(), timezoneOffset);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday, timezoneOffset);

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const sortedAsc = [...dates].sort((a, b) => new Date(a) - new Date(b));
      if (sortedAsc.length > 0) {
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 1; i < sortedAsc.length; i++) {
          const prev = new Date(sortedAsc[i - 1]);
          const curr = new Date(sortedAsc[i]);
          const diffTime = Math.abs(curr - prev);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        }
      }

      let startOffset = 0;
      if (sorted.includes(todayStr)) {
        currentStreak = 1;
      } else if (sorted.includes(yesterdayStr)) {
        currentStreak = 1;
        startOffset = 1;
      } else {
        currentStreak = 0;
      }

      if (currentStreak > 0) {
        let checkDate = new Date();
        if (startOffset === 1) {
          checkDate.setDate(checkDate.getDate() - 1);
        }
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkDateStr = getLocalDateString(checkDate, timezoneOffset);
          if (sorted.includes(checkDateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      return { currentStreak, longestStreak };
    };

    const { currentStreak, longestStreak } = calculateStreak(streakDates);

    const completedByDate = {};
    tasks.forEach(task => {
      let completionDate = null;
      if (task.activityLogs && Array.isArray(task.activityLogs)) {
        const doneLog = [...task.activityLogs]
          .reverse()
          .find(log => log.currentStatus === 'done');
        if (doneLog) {
          completionDate = doneLog.date;
        }
      }
      if (!completionDate) {
        completionDate = task.updatedAt || task.createdAt;
      }
      const dateStr = getLocalDateString(completionDate, timezoneOffset);
      if (dateStr) {
        if (!completedByDate[dateStr]) {
          completedByDate[dateStr] = [];
        }
        completedByDate[dateStr].push({
          taskId: task._id,
          taskName: task.taskName,
          taskKey: task.taskId,
          projectName: task.projectName?.name || task.projectName,
          projectKey: task.projectName?.key || 'MOM',
          completionDate
        });
      }
    });

    const todayDateStr = getLocalDateString(new Date(), timezoneOffset);
    const todayCount = revisionLogsByDate[todayDateStr] ? revisionLogsByDate[todayDateStr].length : 0;

    return res.status(200).json(new ApiResponse(200, {
      currentStreak,
      longestStreak,
      revisionsByDate: revisionLogsByDate,
      completedByDate,
      todayCount,
      todayDateStr
    }, "Revision stats fetched successfully"));
  } catch (error) {
    console.error("Error fetching revision stats:", error);
    return res.status(400).json(new ApiError(400, "Error fetching revision stats"));
  }
});

// Get Completed Parent Tasks (Patterns)
tc.getCompletedParents = asyncHandler(async (req, res) => {
  try {
    const filter = {
      parentTask: null,
      status: "done"
    };

    if (req.branchId) {
      filter.branchId = new mongoose.Types.ObjectId(req.branchId);
    }
    if (req.user?.email !== "balajiaadi2000@gmail.com") {
      filter.createdBy = req.user._id;
    }

    const completedParents = await Task.find(filter)
      .populate("projectName", "name key")
      .select("taskName taskId status projectName")
      .lean();

    return res.status(200).json(
      new ApiResponse(200, completedParents, "Completed parent tasks retrieved successfully")
    );
  } catch (error) {
    console.error("Error fetching completed parent tasks:", error);
    return res.status(500).json(new ApiError(500, error.message || "Error fetching completed parent tasks"));
  }
});

// Suggest Revision Challenge using AI
tc.suggestRevisionChallenge = asyncHandler(async (req, res) => {
  const { parentTaskId } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new ApiError(500, "Groq API key is not configured on backend server");
  }

  let parentTask = null;
  if (parentTaskId && parentTaskId !== "random") {
    parentTask = await Task.findById(parentTaskId).populate("projectName");
    if (!parentTask) {
      throw new ApiError(404, "Selected parent task not found");
    }
  } else {
    // Pick a random completed parent task
    const filter = { parentTask: null, status: "done" };
    if (req.branchId) {
      filter.branchId = new mongoose.Types.ObjectId(req.branchId);
    }
    if (req.user?.email !== "balajiaadi2000@gmail.com") {
      filter.createdBy = req.user._id;
    }

    // Exclude projects with key ESP
    const eligibleProjects = await Project.find({ key: { $ne: "ESP" } }).select("_id");
    const eligibleProjectIds = eligibleProjects.map(p => p._id);
    filter.projectName = { $in: eligibleProjectIds };

    const completedParents = await Task.find(filter).populate("projectName");
    if (completedParents.length === 0) {
      throw new ApiError(400, "No completed parent tasks found. Please complete a parent pattern task first.");
    }
    parentTask = completedParents[Math.floor(Math.random() * completedParents.length)];
  }

  if (parentTask.projectName?.key === "ESP") {
    throw new ApiError(400, "AI Challenges are disabled for ESP Arena");
  }

  // Fetch child tasks (solved problems) under this parent task
  const childTasks = await Task.find({ parentTask: parentTask._id }).select("taskName").lean();
  const solvedProblems = childTasks.map(t => t.taskName);
  const solvedProblemsStr = solvedProblems.length > 0
    ? solvedProblems.map((p, i) => `${i + 1}. ${p}`).join("\n")
    : "None (no solved problems yet under this pattern)";

  const prompt = `
You are an expert DSA (Data Structures and Algorithms) coach.
The user is revising the coding pattern/topic: "${parentTask.taskName}".
They have already solved the following problems under this pattern:
${solvedProblemsStr}

Task:
Suggest a random, high-quality coding problem of Medium difficulty that fits this pattern ("${parentTask.taskName}").
The problem must:
1. Be from a well-known coding platform (LeetCode, Codeforces, or GeeksforGeeks).
2. NOT be in the solved problems list above.
3. Have been asked in past technical interviews at major companies (like Google, Amazon, Microsoft, Meta, Netflix, Uber, etc.).

You MUST respond ONLY with a valid JSON object matching the schema below.

JSON Schema:
{
  "parentTaskId": "${parentTask._id}",
  "parentTaskName": "${parentTask.taskName}",
  "problemTitle": "Clean title of the problem (e.g. 'LeetCode 3: Longest Substring Without Repeating Characters')",
  "platform": "LeetCode / Codeforces / GeeksforGeeks",
  "problemUrl": "Provide a valid direct URL to the problem, or a search URL on the platform if direct link is unknown",
  "companies": ["Company1", "Company2"],
  "description": "A very concise 1-2 sentence description of the problem's task/rules",
  "hint": "A helpful hint on how to approach this problem specifically using the '${parentTask.taskName}' pattern"
}
`;

  try {
    const response = await axios.post(
      `https://api.groq.com/openai/v1/chat/completions`,
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: {
          type: "json_object"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    let responseText = response.data?.choices?.[0]?.message?.content || "";
    const challenge = JSON.parse(responseText.trim());

    return res.status(200).json(
      new ApiResponse(200, challenge, "AI revision challenge generated successfully")
    );
  } catch (error) {
    console.error("Groq Revision Challenge Suggestion Error:", error.response?.data || error.message);
    throw new ApiError(500, `AI challenge generation failed: ${error.message}`);
  }
});

const populateDailyRevQuery = (query) => {
  return query
    .populate({
      path: "questions",
      populate: [
        { path: "projectName", select: "name key settings" },
        { path: "parentTask", select: "taskName taskId" }
      ]
    })
    .populate({
      path: "completedQuestions",
      populate: [
        { path: "projectName", select: "name key settings" },
        { path: "parentTask", select: "taskName taskId" }
      ]
    })
    .populate({
      path: "reviseTomorrowQuestions",
      populate: [
        { path: "projectName", select: "name key settings" },
        { path: "parentTask", select: "taskName taskId" }
      ]
    });
};

const formatDailyRevisionResponse = async (dailyRev, user, eligibleBacklogTasks = null, completedCount = null, threshold = 50) => {
  if (!dailyRev) return null;

  let backlogTaskIds;
  let backlogAvailable = false;
  let totalBacklogCount = 0;
  let totalRevisionCount = 0;

  if (eligibleBacklogTasks) {
    backlogTaskIds = new Set(eligibleBacklogTasks.map(t => t._id.toString()));
    backlogAvailable = eligibleBacklogTasks.length > 0;
    totalBacklogCount = eligibleBacklogTasks.length;
  } else {
    let projectFilter = { key: { $in: ["DSA", "DSAP2", "DSAP3"] } };
    if (dailyRev && dailyRev.branchId) {
      projectFilter.branchId = dailyRev.branchId;
    }
    const projects = await Project.find(projectFilter).select("_id");
    const projectIds = projects.map(p => p._id);
    const childTasks = await Task.find({
      projectName: { $in: projectIds },
      parentTask: { $ne: null }
    }).select("_id status taskDueDate").lean();
    
    const userProgress = await UserTaskProgress.find({
      userId: user._id || user.id,
      taskId: { $in: childTasks.map(t => t._id) }
    }).select("taskId status taskDueDate").lean();
    const progressMap = new Map(userProgress.map(p => [p.taskId.toString(), p]));
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    backlogTaskIds = new Set();
    childTasks.forEach(t => {
      const p = progressMap.get(t._id.toString());
      const isDone = (p && p.status === "done") || (!p && checkIsAdmin(user) && t.status === "done");
      if (isDone) {
        totalRevisionCount++;
      } else {
        const status = p ? p.status : t.status;
        const dueDate = (p && p.taskDueDate) ? p.taskDueDate : t.taskDueDate;
        const isBacklog = status === "backlog" || (dueDate && new Date(dueDate) < startOfToday);
        if (isBacklog) {
          backlogTaskIds.add(t._id.toString());
        }
      }
    });
    backlogAvailable = backlogTaskIds.size > 0;
    totalBacklogCount = backlogTaskIds.size;
  }

  const targetBacklogCount = backlogAvailable ? 1 : 0;
  const targetRevisionCount = 4 - targetBacklogCount;

  const revObj = dailyRev.toObject ? dailyRev.toObject() : { ...dailyRev };
  revObj.isEligible = true;
  if (completedCount !== null) revObj.completedCount = completedCount;
  revObj.threshold = threshold;
  revObj.hasBacklog = backlogAvailable;
  revObj.backlogCount = totalBacklogCount;
  revObj.targetRevisionCount = targetRevisionCount;
  revObj.targetBacklogCount = targetBacklogCount;

  if (revObj.questions && Array.isArray(revObj.questions)) {
    revObj.questions = revObj.questions.map(q => {
      const qObj = q.toObject ? q.toObject() : { ...q };
      const qIdStr = (qObj._id || qObj.id || q).toString();
      qObj.isBacklogQuestion = backlogTaskIds.has(qIdStr);
      return qObj;
    });
  }

  return revObj;
};

// Get Daily Revision (Phase 3 Deterministic Spaced Revision)
tc.getDailyRevision = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const timezoneOffset = req.query.timezoneOffset !== undefined ? parseInt(req.query.timezoneOffset) : 0;
    const localDateStr = getLearnerLocalDateStr(new Date(), timezoneOffset);

    // 1. Find qualifying DSA projects (DSA Phase 1, Phase 2, Phase 3 only - exclude RGB)
    let projectFilter = {
      key: { $in: ["DSA", "DSAP2", "DSAP3"] }
    };
    if (req.branchId) {
      projectFilter.branchId = req.branchId;
    }
    const projects = await Project.find(projectFilter).select("_id");
    const projectIds = projects.map(p => p._id);

    // 2. Find all child tasks in DSA Phase 1, Phase 2, Phase 3
    const qualifyingChildTasks = await Task.find({
      projectName: { $in: projectIds },
      parentTask: { $ne: null }
    })
      .select("_id taskName taskId difficulty leetcodeUrl patternRef parentTask projectName createdAt")
      .populate("parentTask", "taskName taskId")
      .populate("projectName", "name key")
      .lean();
    const qualifyingChildTaskIds = qualifyingChildTasks.map(t => t._id);

    // 3. User task progress for qualifying child tasks (strictly user-isolated)
    const allUserProgress = await UserTaskProgress.find({
      userId: userId,
      taskId: { $in: qualifyingChildTaskIds }
    }).lean();

    // 4. Find or initialize today's DailyRevision document for this user
    let dailyRev = await DailyRevision.findOne({
      userId: userId,
      dateStr: localDateStr
    });

    const dailyCompletedTaskIds = dailyRev && Array.isArray(dailyRev.completedQuestions)
      ? dailyRev.completedQuestions.map(q => (q._id || q).toString())
      : [];

    // 5. Run pure deterministic revision scheduler
    const revisionData = calculateRevisionQueue({
      userProgressList: allUserProgress,
      childTasks: qualifyingChildTasks,
      today: new Date(),
      timezoneOffsetMinutes: timezoneOffset,
      dailyCompletedTaskIds
    });

    // 6. Sync / persist today's DailyRevision tracking document
    const recommendedTaskObjectIds = revisionData.recommendedQueue.map(q => new mongoose.Types.ObjectId(q.taskId));
    if (!dailyRev) {
      dailyRev = await DailyRevision.create({
        userId: userId,
        dateStr: localDateStr,
        questions: recommendedTaskObjectIds,
        completedQuestions: [],
        reviseTomorrowQuestions: [],
        isStarted: true,
        isCompleted: revisionData.totalDueCount === 0 && revisionData.completedTodayCount > 0,
        branchId: req.branchId ? new mongoose.Types.ObjectId(req.branchId) : null
      });
    } else {
      if (!dailyRev.questions || dailyRev.questions.length === 0) {
        dailyRev.questions = recommendedTaskObjectIds;
      }
      if (revisionData.totalDueCount === 0 && revisionData.completedTodayCount > 0) {
        dailyRev.isCompleted = true;
      }
      await dailyRev.save();
    }

    return res.status(200).json(
      new ApiResponse(200, {
        isEligible: true,
        dateStr: localDateStr,
        ...revisionData,
        // Compatibility properties for any legacy components
        questions: revisionData.recommendedQueue,
        completedQuestions: revisionData.completedTodayList,
        isCompleted: revisionData.totalDueCount === 0 && revisionData.completedTodayCount > 0,
        isStarted: true
      }, "Daily revision queue retrieved successfully")
    );
  } catch (error) {
    console.error("Error retrieving daily revision:", error);
    return res.status(500).json(new ApiError(500, error.message || "Error retrieving daily revision"));
  }
});

// Start Daily Revision
tc.startDailyRevision = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const timezoneOffset = req.body.timezoneOffset ? parseInt(req.body.timezoneOffset) : 0;
    const localDateStr = getLocalDateString(new Date(), timezoneOffset);

    let dailyRev = await DailyRevision.findOne({
      userId: userId,
      dateStr: localDateStr
    });

    if (!dailyRev) {
      dailyRev = await DailyRevision.findOne({
        userId: userId,
        isCompleted: false
      });
      if (dailyRev) {
        dailyRev.dateStr = localDateStr;
        await dailyRev.save();
      }
    }

    if (!dailyRev || !dailyRev.questions || dailyRev.questions.length === 0) {
      throw new ApiError(404, "Today's daily revision is not generated yet or user has not reached the threshold");
    }

    dailyRev.isStarted = true;
    dailyRev.timerIsActive = true;
    dailyRev.timerLastUpdated = new Date();
    dailyRev.currentQuestionStartTimeLeft = 10800;
    await dailyRev.save();

    dailyRev = await populateDailyRevQuery(DailyRevision.findById(dailyRev._id));

    const revObj = await formatDailyRevisionResponse(dailyRev, req.user);

    return res.status(200).json(
      new ApiResponse(200, revObj, "Daily revision timer started successfully")
    );
  } catch (error) {
    console.error("Error starting daily revision:", error);
    return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message || "Error starting daily revision"));
  }
});

// Toggle Daily Revision Timer
tc.toggleDailyRevisionTimer = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const timezoneOffset = req.body.timezoneOffset ? parseInt(req.body.timezoneOffset) : 0;
    const localDateStr = getLocalDateString(new Date(), timezoneOffset);

    let dailyRev = await DailyRevision.findOne({
      userId: userId,
      dateStr: localDateStr
    });

    if (!dailyRev) {
      dailyRev = await DailyRevision.findOne({
        userId: userId,
        isCompleted: false
      });
      if (dailyRev) {
        dailyRev.dateStr = localDateStr;
        await dailyRev.save();
      }
    }

    if (!dailyRev) {
      throw new ApiError(404, "Today's daily revision is not generated yet");
    }

    if (!dailyRev.isStarted) {
      throw new ApiError(400, "Daily revision has not been started yet");
    }

    if (dailyRev.isCompleted) {
      const revObj = await formatDailyRevisionResponse(dailyRev, req.user);
      return res.status(200).json(
        new ApiResponse(200, revObj, "Daily revision is already completed")
      );
    }

    if (dailyRev.timerIsActive) {
      // Pause: Calculate elapsed time and update timeLeft
      const now = Date.now();
      const lastUpdate = dailyRev.timerLastUpdated ? new Date(dailyRev.timerLastUpdated).getTime() : now;
      const elapsed = Math.floor((now - lastUpdate) / 1000);

      dailyRev.timeLeft = Math.max(0, dailyRev.timeLeft - elapsed);
      dailyRev.timerIsActive = false;
      dailyRev.timerLastUpdated = null;
    } else {
      // Resume
      dailyRev.timerIsActive = true;
      dailyRev.timerLastUpdated = new Date();
    }

    await dailyRev.save();

    dailyRev = await populateDailyRevQuery(DailyRevision.findById(dailyRev._id));

    const revObj = await formatDailyRevisionResponse(dailyRev, req.user);

    return res.status(200).json(
      new ApiResponse(200, revObj, "Daily revision timer state toggled successfully")
    );
  } catch (error) {
    console.error("Error toggling daily revision timer:", error);
    return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message || "Error toggling daily revision timer"));
  }
});

// Sync Daily Revision Timer
tc.syncDailyRevisionTimer = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeLeft, timerIsActive, timezoneOffset } = req.body;
    const offset = timezoneOffset !== undefined ? parseInt(timezoneOffset) : 0;
    const localDateStr = getLocalDateString(new Date(), offset);

    let dailyRev = await DailyRevision.findOne({
      userId: userId,
      dateStr: localDateStr
    });

    if (!dailyRev) {
      dailyRev = await DailyRevision.findOne({
        userId: userId,
        isCompleted: false
      });
      if (dailyRev) {
        dailyRev.dateStr = localDateStr;
        await dailyRev.save();
      }
    }

    if (!dailyRev) {
      throw new ApiError(404, "Today's daily revision is not generated yet");
    }

    if (timeLeft !== undefined) {
      dailyRev.timeLeft = Math.max(0, parseInt(timeLeft));
    }

    if (timerIsActive !== undefined) {
      dailyRev.timerIsActive = !!timerIsActive;
      dailyRev.timerLastUpdated = dailyRev.timerIsActive ? new Date() : null;
    }

    await dailyRev.save();

    const revObj = await formatDailyRevisionResponse(dailyRev, req.user);

    return res.status(200).json(
      new ApiResponse(200, revObj, "Daily revision timer synced successfully")
    );
  } catch (error) {
    console.error("Error syncing daily revision timer:", error);
    return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message || "Error syncing daily revision timer"));
  }
});

// Toggle Revise Tomorrow
tc.toggleReviseTomorrow = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId, reviseTomorrow, timezoneOffset } = req.body;
    const offset = timezoneOffset !== undefined ? parseInt(timezoneOffset) : 0;
    const localDateStr = getLocalDateString(new Date(), offset);

    let dailyRev = await DailyRevision.findOne({
      userId: userId,
      dateStr: localDateStr
    });

    if (!dailyRev) {
      dailyRev = await DailyRevision.findOne({
        userId: userId,
        isCompleted: false
      });
      if (dailyRev) {
        dailyRev.dateStr = localDateStr;
        await dailyRev.save();
      }
    }

    if (!dailyRev) {
      throw new ApiError(404, "Today's daily revision is not generated yet");
    }

    if (!dailyRev.reviseTomorrowQuestions) {
      dailyRev.reviseTomorrowQuestions = [];
    }

    const taskObjectId = new mongoose.Types.ObjectId(taskId);
    if (reviseTomorrow) {
      const alreadyExists = dailyRev.reviseTomorrowQuestions.some(id => id.toString() === taskId.toString());
      if (!alreadyExists) {
        dailyRev.reviseTomorrowQuestions.push(taskObjectId);
      }
    } else {
      dailyRev.reviseTomorrowQuestions = dailyRev.reviseTomorrowQuestions.filter(
        id => id.toString() !== taskId.toString()
      );
    }

    await dailyRev.save();

    dailyRev = await populateDailyRevQuery(DailyRevision.findById(dailyRev._id));

    const revObj = await formatDailyRevisionResponse(dailyRev, req.user);

    return res.status(200).json(
      new ApiResponse(200, revObj, "Revise tomorrow preference updated successfully")
    );
  } catch (error) {
    console.error("Error toggling revise tomorrow:", error);
    return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message || "Error toggling revise tomorrow"));
  }
});

// Phase 4: Get Deterministic Pattern Alerts for Authenticated User
tc.getPatternAlerts = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Locate DSA Projects
    const dsaProjectRegex = /dsa/i;
    const projects = await Project.find({ name: { $regex: dsaProjectRegex } }).select("_id").lean();
    const projectIds = projects.map(p => p._id);

    // 2. Fetch all DSA child tasks with parentTask and patternRef
    const qualifyingChildTasks = await Task.find({
      projectName: { $in: projectIds },
      parentTask: { $ne: null }
    })
      .select("_id taskName taskId difficulty leetcodeUrl patternRef parentTask projectName createdAt")
      .populate("parentTask", "taskName taskId")
      .populate("patternRef", "name slug")
      .lean();

    const qualifyingChildTaskIds = qualifyingChildTasks.map(t => t._id);

    // 3. Fetch UserTaskProgress strictly for this user (Multi-User Isolation Guarantee)
    const userProgressList = await UserTaskProgress.find({
      userId: userId,
      taskId: { $in: qualifyingChildTaskIds }
    }).lean();

    // 4. Run pure deterministic pattern weakness analyzer
    const analysis = analyzePatternWeaknesses({
      userProgressList,
      childTasks: qualifyingChildTasks,
      today: new Date(),
      maxRecencyDays: 90
    });

    return res.status(200).json(
      new ApiResponse(200, analysis, "Pattern alerts retrieved successfully")
    );
  } catch (error) {
    console.error("Error fetching pattern alerts:", error);
    return res.status(500).json(new ApiError(500, error.message || "Failed to fetch pattern alerts"));
  }
});

export default tc;