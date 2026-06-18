import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Task } from "../../models/task.model.js";
import { Project } from "../../models/project.model.js";
import { Sprint } from "../../models/sprint.model.js";
import mongoose from "mongoose";
import { calculateStatusDuration } from "../../utils/calculateStatusDuration.js";
import { Notification } from "../../models/notification.model.js";
import notificationService from "../notification-service/notification.service.js";
import { socketService } from "../../socket-instance.js";
import { ProgressService } from "../progress-service/progress.service.js";
import AnalyticsService from "../analytics-service/analytics.service.js";

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
      status,
      progress,
      parentTask,
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
      attachments,
      milestone: milestone || null,
      status,
      progress: progress || 0,
      createdBy: req.user?._id,
      parentTask: parentTask || null,
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
  console.log("req.body", req.body)
  try {
    if (!req.params.taskId || req.params.taskId === "undefined") {
      return res.status(400).json(new ApiError(400, "Task ID not provided"));
    }

    const {
      projectName,
      taskName,
      taskPriority,
      taskType,
      taskStartDate,
      taskDueDate,
      assignee,
      status,
      milestone,
      attachments,
      taskDescription,
      dependentTasks,
      estimatedHours,
      backlogEstimatedHours,
      storyPoints,
      epic,
      sprint,
      additionalNotes,
      progress,
      parentTask,
    } = req.body;

    const existingTask = await Task.findById(req.params.taskId);
    if (!existingTask) {
      return res.status(400).json(new ApiError(400, "Task not found"));
    }

    // Status Restriction: Any task cannot be 'done' if it has pending subtasks
    if (status === 'done') {
        const pendingSubtasks = await Task.countDocuments({
            parentTask: new mongoose.Types.ObjectId(existingTask._id),
            status: { $ne: 'done' }
        });
        if (pendingSubtasks > 0) {
            return res.status(400).json(new ApiError(400, "Cannot complete task while subtasks are still pending."));
        }
    }

    // Date Validation for Subtasks
    if (existingTask.parentTask) {
        const parent = await Task.findById(existingTask.parentTask);
        if (parent) {
            const start = taskStartDate ? new Date(taskStartDate) : existingTask.taskStartDate ? new Date(existingTask.taskStartDate) : null;
            const due = taskDueDate ? new Date(taskDueDate) : existingTask.taskDueDate ? new Date(existingTask.taskDueDate) : null;
            
            const pStart = parent.taskStartDate ? new Date(parent.taskStartDate) : null;
            const pDue = parent.taskDueDate ? new Date(parent.taskDueDate) : null;

            if (pStart && start && start < pStart) {
                return res.status(400).json(new ApiError(400, `Subtask start date cannot be before parent task start date (${pStart.toLocaleDateString()})`));
            }
            if (pDue && due && due > pDue) {
                return res.status(400).json(new ApiError(400, `Subtask due date cannot be after parent task due date (${pDue.toLocaleDateString()})`));
            }
        }
    }

    let activityLogEntry = null;
    if (status && existingTask.status !== status) {
      activityLogEntry = {
        oldStatus: existingTask.status,
        currentStatus: status,
        user: req.user?._id,
        date: new Date(),
        message: `Task has been updated from ${existingTask.status} >>> ${status}`,
      };
    }

    // Construct update object with only defined fields (Partial Update)
    const updateFields = {};
    if (projectName !== undefined) updateFields.projectName = projectName;
    if (taskName !== undefined) updateFields.taskName = taskName;
    if (taskPriority !== undefined) updateFields.taskPriority = taskPriority;
    if (taskType !== undefined) updateFields.taskType = taskType;
    if (taskStartDate !== undefined) updateFields.taskStartDate = taskStartDate;
    if (taskDueDate !== undefined) updateFields.taskDueDate = taskDueDate;
    if (assignee !== undefined) updateFields.assignee = assignee;
    if (taskDescription !== undefined) updateFields.taskDescription = taskDescription;
    if (attachments !== undefined) updateFields.attachments = attachments;
    if (estimatedHours !== undefined) updateFields.estimatedHours = estimatedHours;
    if (backlogEstimatedHours !== undefined) updateFields.backlogEstimatedHours = backlogEstimatedHours;
    if (storyPoints !== undefined) updateFields.storyPoints = storyPoints;
    if (epic !== undefined) updateFields.epic = epic;
    if (sprint !== undefined) updateFields.sprint = sprint;
    if (dependentTasks !== undefined) updateFields.dependentTasks = dependentTasks;
    if (milestone !== undefined) updateFields.milestone = milestone || null;
    if (parentTask !== undefined) updateFields.parentTask = parentTask ? new mongoose.Types.ObjectId(parentTask) : null;
    if (additionalNotes !== undefined) updateFields.additionalNotes = additionalNotes;
    if (status !== undefined) {
      updateFields.status = status;
      if (status === 'hold') {
        if (!existingTask.parentTask) {
          updateFields.holdDate = new Date();
        }
      } else if (existingTask.status === 'hold') {
        if (!existingTask.parentTask) {
          updateFields.holdDate = null;
        }
      }
    }
    if (progress !== undefined) updateFields.progress = progress;
    if (status === 'done') updateFields.progress = 100;
    else if (status === 'todo' && progress === undefined) updateFields.progress = 0;
    
    updateFields.updatedBy = req.user?._id;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.taskId, branchId: req.branchId },
      {
        ...updateFields,
        ...(activityLogEntry && {
          $push: {
            activityLogs: {
              $each: [activityLogEntry],
              $position: 0,
            },
          },
        }),
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(400).json(new ApiError(400, "Task not found"));
    }

    // Cascade hold status to child tasks if status changed
    if (status && existingTask.status !== status) {
        await handleHoldCascade(updatedTask, status, existingTask.status, req.user?._id);
    }

    // Only send notification if assignee and projectName are known (either updated or existing)
    const recipientId = assignee || updatedTask.assignee;
    const projId = projectName || updatedTask.projectName;

    if (recipientId && projId) {
        try {
            await Notification.create({
                senderId: req.user?._id,
                receiverId: new mongoose.Types.ObjectId(recipientId),
                title: "Task updated for you",
                message: taskName || updatedTask.taskName,
                projectId: new mongoose.Types.ObjectId(projId),
            });

            const message = { title: "Task updated for you", body: taskName || updatedTask.taskName };
            socketService._io.emit("notification", message, recipientId);
            await notificationService(new mongoose.Types.ObjectId(recipientId), message);
        } catch (notifErr) {
            console.error("Non-blocking notification error:", notifErr);
        }
    }

    // Cascading Progress Updates
    if (updatedTask.parentTask) await ProgressService.updateParentTaskProgress(updatedTask.parentTask);
    
    // If parent changed, update the OLD parent's progress as well
    if (existingTask.parentTask && existingTask.parentTask.toString() !== (updatedTask.parentTask?.toString() || "")) {
        await ProgressService.updateParentTaskProgress(existingTask.parentTask);
    }

    if (updatedTask.milestone) await ProgressService.updateMilestoneProgress(updatedTask.milestone);
    if (updatedTask.projectName) await ProgressService.updateProjectProgress(updatedTask.projectName);
    if (updatedTask.sprint) await ProgressService.updateSprintProgress(updatedTask.sprint);

    // Update Analytics
    if (status && existingTask.status !== status) {
        AnalyticsService.handleTaskUpdate(updatedTask.assignee, updatedTask.projectName, updatedTask._id, existingTask.status, status).catch(err => console.error("Analytics Error:", err));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res.status(400).json(new ApiError(404, "Internal server error"));
  }
});


// get task by id
tc.getTaskById = asyncHandler(async (req, res) => {
  try {
    if (req.params.taskId == "undefined" || !req.params.taskId) {
      return res.status(400).json(new ApiError(400, "id not provided"));
    }
    const task = await Task.findOne({ _id: req.params.taskId, branchId: req.branchId }).populate(
      "projectName assignee activityLogs.user"
    );

    if (!task) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }
    task.activityLogs.sort((a, b) => b.date - a.date);
    const duration = calculateStatusDuration(task.activityLogs);

    const taskWithDuration = {
      ...task.toObject(),
      duration,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, taskWithDuration, "Task fetched successfully")
      );
  } catch (error) {
    console.log("Error------", error);
    return res.status(400).json(new ApiError(404, error, "Error"));
  }
});


import { checkAndTransitionTasks } from "./taskTransition.job.js";

// get all tasks
tc.getallTasks = asyncHandler(async (req, res) => {
  console.log("req.body--->", req.body);
  
  try {
    const { search = "" } = req.query;
    let { filter = {}, sortOrder = -1 } = req.body;
    
    // Enforce branch isolation
    if (req.branchId) {
      filter.branchId = new mongoose.Types.ObjectId(req.branchId);
    }
    // Extract permissions from req.user (already populated in auth middleware)
    const permissions = new Set();
    
    if (req.user?.userRole?.active && req.user?.userRole?.permissions) {
        req.user.userRole.permissions.forEach(p => {
             if (p && p.name) permissions.add(p.name);
        });
    }

    req.user?.userRoles?.forEach(role => {
        if (role.active && role.permissions) {
            role.permissions.forEach(p => {
                if (p && p.name) permissions.add(p.name);
            });
        }
    });

    let searchCondition = {};
    if (search && search !== "undefined") {
      const regex = new RegExp(search, "i");
      searchCondition.$or = [
        { taskName: { $regex: regex } },
        { taskPriority: { $regex: regex } },
        { taskType: { $regex: regex } },
        { taskDescription: { $regex: regex } },
        { additionalNotes: { $regex: regex } },
        { status: { $regex: regex } },
      ];
    }

    if (filter?.projectName) {
      filter.projectName = new mongoose.Types.ObjectId(filter.projectName);
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

    // ENFORCE INDIVIDUAL ISOLATION: User only sees what they created
    if (req.user?.email !== "balajiaadi2000@gmail.com") {
        filter.createdBy = req.user._id;
    }

    if (filter?.type === "open") {
      searchCondition.status = { $in: ["todo", "inprogress"] };
    } else if (filter?.type === "hold") {
      searchCondition.status = "hold";
    }

    delete filter.type;

    const tasks = await Task.find({ ...searchCondition, ...filter })
    .populate("projectName", "name key settings")
    .populate("assignee", "firstName lastName email")
    .populate("milestone", "milestoneName")
    .populate("epic", "epicName")
    .populate("sprint", "sprintName startDate endDate")
    .populate("parentTask", "taskName taskId status taskStartDate taskDueDate holdDate")
    .populate({
      path: "createdBy",
      select: "firstName lastName email"
    })
    .sort({ _id: sortOrder })
    .lean();
  
    // Auto-sync subtasks of held parent tasks
    const syncedTasks = await autoSyncHeldParentChildren(tasks, req.user?._id);

    // Map tasks to include pre-calculated duration
    syncedTasks.forEach(task => {
        task.duration = calculateStatusDuration(task.activityLogs || []);
    });
  

    if (syncedTasks.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "No tasks found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, syncedTasks, "Tasks fetched successfully"));
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
    // If it's a parent task
    if (!parentTask.parentTask) {
        if (newStatus === 'hold') {
            // Find all child tasks (supporting both ObjectId and string representations in DB)
            const childTasks = await Task.find({
                $or: [
                    { parentTask: parentTask._id },
                    { parentTask: parentTask._id.toString() }
                ]
            });
            for (const child of childTasks) {
                // Only put non-done, non-hold child tasks on hold
                if (child.status !== 'hold' && child.status !== 'done') {
                    child.activityLogs.unshift({
                        oldStatus: child.status,
                        currentStatus: 'hold',
                        user: userId,
                        date: new Date(),
                        message: `Status had been changed from ${child.status} >>> hold (inherited from parent task hold)`,
                    });
                    child.status = 'hold';
                    child.updatedBy = userId;
                    await child.save();
                    AnalyticsService.handleTaskUpdate(child.assignee, child.projectName, child._id, child.status, 'hold').catch(err => console.error("Analytics Error:", err));
                }
            }
        } else if (oldStatus === 'hold' && newStatus !== 'hold') {
            // Release all held child tasks to 'todo'
            const childTasks = await Task.find({
                $or: [
                    { parentTask: parentTask._id },
                    { parentTask: parentTask._id.toString() }
                ]
            });
            for (const child of childTasks) {
                if (child.status === 'hold') {
                    child.activityLogs.unshift({
                        oldStatus: 'hold',
                        currentStatus: 'todo',
                        user: userId,
                        date: new Date(),
                        message: `Status had been changed from hold >>> todo (released from parent task hold)`,
                    });
                    child.status = 'todo';
                    child.updatedBy = userId;
                    await child.save();
                    AnalyticsService.handleTaskUpdate(child.assignee, child.projectName, child._id, 'hold', 'todo').catch(err => console.error("Analytics Error:", err));
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

    // 2. Loop through all fetched tasks and sync child tasks
    for (let task of tasks) {
        const pIdStr = getParentTaskId(task.parentTask);
        if (pIdStr && heldParentIds.includes(pIdStr)) {
            // This child belongs to a held parent task.
            // If it is not 'done' and not 'hold', update it to 'hold'!
            if (task.status !== 'hold' && task.status !== 'done') {
                // Update in DB
                await Task.updateOne(
                    { _id: task._id },
                    {
                        $set: { status: 'hold', updatedBy: userId },
                        $push: {
                            activityLogs: {
                                $each: [{
                                    oldStatus: task.status,
                                    currentStatus: 'hold',
                                    user: userId,
                                    date: new Date(),
                                    message: `Status automatically synced to hold because parent task is on hold`,
                                }],
                                $position: 0
                            }
                        }
                    }
                );
                
                // Update in returned list object
                task.status = 'hold';
                if (!task.activityLogs) task.activityLogs = [];
                task.activityLogs.unshift({
                    oldStatus: task.status,
                    currentStatus: 'hold',
                    user: userId,
                    date: new Date(),
                    message: `Status automatically synced to hold because parent task is on hold`,
                });
                
                // Trigger analytics update
                AnalyticsService.handleTaskUpdate(task.assignee, task.projectName, task._id, task.status, 'hold').catch(err => console.error("Analytics Error:", err));
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
    const { status } = req.body;

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
        // Check if user is an employee (doesn't have UPDATE_TASK or CREATE_SPRINT)
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

    // Status Restriction: Any task cannot be 'done' if it has pending subtasks
    if (status === 'done') {
        const pendingSubtasks = await Task.countDocuments({
            parentTask: new mongoose.Types.ObjectId(task._id),
            status: { $ne: 'done' }
        });
        if (pendingSubtasks > 0) {
            return res.status(400).json(new ApiError(400, "Cannot complete task while subtasks are still pending."));
        }
    }

    const oldStatus = task.status; // Store old status before updating

    if (status === 'hold') {
        if (!task.parentTask) {
            task.holdDate = new Date();
        }
    } else if (oldStatus === 'hold') {
        if (!task.parentTask) {
            task.holdDate = null;
        }
    }

    task.activityLogs.unshift({
      oldStatus: task.status,
      currentStatus: status,
      user: req.user?._id, // Ensure this is stored as an ObjectId
      date: new Date(),
      message: `Status had been changed from ${task.status} >>> ${status}`,
    });

    task.status = status;
    if (status === 'done') task.progress = 100;
    else if (status === 'todo') task.progress = 0;

    task.updatedBy = req.user?._id;
    await task.save();

    // Cascading Hold Status to children if parent is put on hold / released
    await handleHoldCascade(task, status, oldStatus, req.user?._id);

    // Cascading Progress Updates
    await ProgressService.updateParentTaskProgress(task.parentTask);
    if (task.milestone) await ProgressService.updateMilestoneProgress(task.milestone);
    if (task.projectName) await ProgressService.updateProjectProgress(task.projectName);
    if (task.sprint) await ProgressService.updateSprintProgress(task.sprint);

    // Update Analytics
    if (status && oldStatus !== status) {
        AnalyticsService.handleTaskUpdate(task.assignee, task.projectName, task._id, oldStatus, status).catch(err => console.error("Analytics Error:", err));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, task, "Task status updated successfully"));
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
    
    // Enforce branch isolation
    if (req.branchId) {
      filter.branchId = new mongoose.Types.ObjectId(req.branchId);
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
        { status: { $regex: regex } },
      ];
    }
    
    if (req.user?.email !== "balajiaadi2000@gmail.com") {
        filter.createdBy = req.user._id;
    }

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
    .sort({ _id: sortOrder });;

    // Auto-sync subtasks of held parent tasks
    const syncedTasks = await autoSyncHeldParentChildren(tasks, req.user?._id);

    if (syncedTasks.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "No tasks found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, syncedTasks, "Tasks fetched successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res
      .status(400)
      .json(new ApiError(400, error.message || "Error fetching tasks"));
  }
});

// Add Revision
tc.addRevision = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { notes, revisionDate } = req.body;

    if (!taskId) {
        return res.status(400).json(new ApiError(400, "Task ID is required"));
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json(new ApiError(404, "Task not found"));
    }

    const revisionLog = {
        revisionDate: revisionDate || new Date(),
        notes: notes || "",
        revisedBy: req.user?._id
    };

    if (!task.revisionLogs) task.revisionLogs = [];
    task.revisionLogs.push(revisionLog);
    
    await task.save();

    return res.status(200).json(new ApiResponse(200, task, "Revision logged successfully"));
});

const getLocalDateString = (date, offsetMinutes = 0) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const adjusted = new Date(d.getTime() - (offsetMinutes * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
};

// Get Revision Stats
tc.getRevisionStats = asyncHandler(async (req, res) => {
    try {
        const timezoneOffset = req.query.timezoneOffset ? parseInt(req.query.timezoneOffset) : 0;
        
        const filter = {};
        if (req.branchId) {
            filter.branchId = new mongoose.Types.ObjectId(req.branchId);
        }
        if (req.user?.email !== "balajiaadi2000@gmail.com") {
            filter.createdBy = req.user._id;
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
        
        return res.status(200).json(new ApiResponse(200, {
            currentStreak,
            longestStreak,
            revisionsByDate: revisionLogsByDate,
            completedByDate
        }, "Revision stats fetched successfully"));
    } catch (error) {
        console.error("Error fetching revision stats:", error);
        return res.status(400).json(new ApiError(400, "Error fetching revision stats"));
    }
});

export default tc;