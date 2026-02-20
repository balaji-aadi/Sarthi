import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Sprint } from "../../models/sprint.model.js";
import { Project } from "../../models/project.model.js";
import { Task } from "../../models/task.model.js";
import { calculateStatusDuration } from "../../utils/calculateStatusDuration.js";

const sprintController = {};

// Create Sprint
sprintController.createSprint = asyncHandler(async (req, res) => {
    const { projectId, name, startDate, endDate, goal, status } = req.body;

    if (!projectId || !name || !startDate || !endDate) {
        throw new ApiError(400, "Project ID, Name, Start Date, and End Date are required.");
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const sprint = await Sprint.create({
        project: projectId,
        name,
        startDate,
        endDate,
        goal,
        status: status || 'planned',
        createdBy: req.user?._id
    });

    return res.status(201).json(
        new ApiResponse(201, sprint, "Sprint created successfully")
    );
});

// Get Sprints by Project
sprintController.getSprintsByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    const sprints = await Sprint.find({ project: projectId })
        .sort({ startDate: 1 }); // Sort chronologically

    return res.status(200).json(
        new ApiResponse(200, sprints, "Sprints fetched successfully")
    );
});

// Update Sprint
sprintController.updateSprint = asyncHandler(async (req, res) => {
    const { sprintId } = req.params;
    const { name, startDate, endDate, goal, status } = req.body;

    const existingSprint = await Sprint.findById(sprintId);
    if (!existingSprint) {
        throw new ApiError(404, "Sprint not found");
    }

    // Restriction: Cannot edit if sprint has started
    if (new Date() >= new Date(existingSprint.startDate)) {
        throw new ApiError(400, "Cannot edit a sprint that has already started.");
    }

    const sprint = await Sprint.findByIdAndUpdate(
        sprintId,
        {
            $set: {
                name,
                startDate,
                endDate,
                goal,
                status
            }
        },
        { new: true }
    );

    if (!sprint) {
        throw new ApiError(404, "Sprint not found");
    }

    return res.status(200).json(
        new ApiResponse(200, sprint, "Sprint updated successfully")
    );
});

// Delete Sprint
sprintController.deleteSprint = asyncHandler(async (req, res) => {
    const { sprintId } = req.params;

    const existingSprint = await Sprint.findById(sprintId);
    if (!existingSprint) {
        throw new ApiError(404, "Sprint not found");
    }

    // Restriction: Cannot delete if sprint has started
    if (new Date() >= new Date(existingSprint.startDate)) {
        throw new ApiError(400, "Cannot delete a sprint that has already started.");
    }

    const sprint = await Sprint.findByIdAndDelete(sprintId);

    if (!sprint) {
        throw new ApiError(404, "Sprint not found");
    }

    return res.status(200).json(
        new ApiResponse(200, sprint, "Sprint deleted successfully")
    );
});

// Get Sprint Report
sprintController.getSprintReport = asyncHandler(async (req, res) => {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId).populate('project');
    if (!sprint) {
        throw new ApiError(404, "Sprint not found");
    }

    // Fetch all tasks in this sprint
    const tasks = await Task.find({ sprint: sprintId }).populate('assignee activityLogs.user');

    // 1. Completion Progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalStoryPoints = tasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const completedStoryPoints = tasks.filter(t => t.status === 'done').reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    // 2. Status Breakdown
    const statusCounts = tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    // 3. User Performance Metrics
    const userPerformance = {};

    tasks.forEach(task => {
        if (!task.assignee) return;
        const userId = task.assignee._id.toString();
        const userName = `${task.assignee.firstName} ${task.assignee.lastName}`;

        if (!userPerformance[userId]) {
            userPerformance[userId] = {
                name: userName,
                tasksCompleted: 0,
                totalPointsCompleted: 0,
                totalInProgressMinutes: 0,
                tasksAssigned: 0
            };
        }

        userPerformance[userId].tasksAssigned += 1;
        if (task.status === 'done') {
            userPerformance[userId].tasksCompleted += 1;
            userPerformance[userId].totalPointsCompleted += (task.storyPoints || 0);
        }

        // Calculate time spent in in-progress for this task
        if (task.activityLogs && task.activityLogs.length > 0) {
            const duration = calculateStatusDuration(task.activityLogs);
            userPerformance[userId].totalInProgressMinutes += duration.inprogress || 0;
        }
    });

    // Convert performance object to array and calculate ranks
    const performanceArray = Object.entries(userPerformance).map(([id, stats]) => ({
        id,
        ...stats
    }));

    // Sort by points completed (as one indicator)
    const sortedPerformers = [...performanceArray].sort((a, b) => b.totalPointsCompleted - a.totalPointsCompleted);

    const report = {
        sprint: {
            name: sprint.name,
            goal: sprint.goal,
            status: sprint.status,
            dates: { start: sprint.startDate, end: sprint.endDate }
        },
        stats: {
            totalTasks,
            completedTasks,
            completionPercentage: totalTasks ? Math.round((completedTasks/totalTasks) * 100) : 0,
            totalStoryPoints,
            completedStoryPoints,
            burnDownPercentage: totalStoryPoints ? Math.round((completedStoryPoints/totalStoryPoints) * 100) : 0
        },
        statusCounts,
        userPerformance: performanceArray,
        topPerformers: sortedPerformers.slice(0, 3), // Top 3
        lowerPerformers: [...performanceArray].sort((a, b) => a.totalPointsCompleted - b.totalPointsCompleted).slice(0, 3),
        backlog: tasks.filter(t => t.status !== 'done').map(t => ({ id: t._id, name: t.taskName, status: t.status, assignee: t.assignee?.firstName }))
    };

    return res.status(200).json(
        new ApiResponse(200, report, "Sprint report generated successfully")
    );
});

export default sprintController;
