import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Project } from "../../models/project.model.js";
import mongoose from "mongoose";
import { Milestone } from "../../models/milestone.model.js"
import { Task } from "../../models/task.model.js"

const pc = {}

// create Project
pc.createProject = asyncHandler(async (req, res) => {
  console.log("Req.body", req.body);

  try {
    const { name, access, key, description, startDate, endDate, priority, clientName, budget, projectManager,
      teamMembers, rolesAndResponsibilities, milestones, status, githubRepository
    } = req.body;

    const requiredFields = { name, access, key, startDate, endDate, priority, projectManager, rolesAndResponsibilities, status };

    const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field] || requiredFields[field] === 'undefined');

    if (missingFields.length > 0) {
      return res.status(400).json(new ApiError(400, `Missing required field: ${missingFields.join(', ')}`));
    }

    const createdProject = await Project.create({
      name,
      access,
      key,
      description,
      startDate,
      endDate,
      priority,
      clientName,
      githubRepository,
      budget,
      projectManager,
      teamMembers,
      rolesAndResponsibilities,
      status,
      createdBy: req.user?._id
    });

    if (Array.isArray(milestones) && milestones.length > 0) {
      const milestoneDocs = milestones.map((milestone) => ({
        ...milestone,
        project: createdProject._id,
      }));

      await Milestone.insertMany(milestoneDocs);
    }

    return res.status(201).json(new ApiResponse(201, createdProject, "Project created successfully"));
  } catch (error) {
    console.log("Error------", error)
    return res.status(400).json(new ApiError(404, error, "Error"));
  }
});


//update Project
pc.updateProject = asyncHandler(async (req, res) => {
  console.log("!!! SUPER DISTINCT LOG - Update Project !!!");
  console.log("Req.body keys:", Object.keys(req.body));
  console.log("Github Repo in body:", req.body.githubRepository);

  try {
    if (req.params.projectId == "undefined" || !req.params.projectId) {
      return res.status(400).json(new ApiError(400, "id not provided"));
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json(new ApiError(400, "No data provided to update"))
    }

    const { name, access, key, description, startDate, endDate, priority, clientName, budget, projectManager,
      teamMembers, rolesAndResponsibilities, milestones, status, githubRepository, settings
    } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        name,
        access,
        key,
        description,
        startDate,
        endDate,
        priority,
        clientName,
        githubRepository,
        budget,
        projectManager,
        teamMembers,
        rolesAndResponsibilities,
        milestones,
        status,
        settings,
        updatedBy: req.user?._id
        },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json(new ApiError(404, "Project not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedProject, "Project updated successfully"));
  } catch (error) {
    console.log("Error------", error)
    return res.status(400).json(new ApiError(404, error, "Error"));
  }

});


// Get project by id
pc.getProjectById = asyncHandler(async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || projectId === "undefined") {
      return res.status(400).json(new ApiError(400, "Project ID not provided"));
    }

    const project = await Project.findById(projectId)
      .populate("projectManager teamMembers");

    if (!project) {
      return res.status(404).json(new ApiError(404, "Project not found"));
    }

    const milestones = await Milestone.find({ project: projectId });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones,
    };

    return res.status(200).json(new ApiResponse(200, projectWithMilestones, "Project fetched successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res.status(400).json(new ApiError(400, error.message || "Error fetching project"));
  }
});




// ... existing imports ...

// Get all active project
pc.getAllProject = asyncHandler(async (req, res) => {
  console.log("req.body...", req.body);

  try {
    const { search = "" } = req.query;
    const { filter = {}, sortOrder = -1 } = req.body;

    // Filter logic
    let filterQuery = {};

    // 1. Search Query
    if (search && search !== "undefined") {
      const regex = new RegExp(search, "i");
      let objectIdSearch = null;

      if (mongoose.Types.ObjectId.isValid(search)) {
        objectIdSearch = new mongoose.Types.ObjectId(search);
      }

      filterQuery.$or = [
        { name: { $regex: regex } },
        { startDate: { $regex: regex } },
        { endDate: { $regex: regex } },
        { "rolesAndResponsibilities.role": { $regex: regex } },
        { "rolesAndResponsibilities.responsibility": { $regex: regex } },
        { "rolesAndResponsibilities.teamMember.name": { $regex: regex } },
        { status: { $regex: regex } }
      ];

      if (objectIdSearch) {
        filterQuery.$or.push(
          { teamMembers: objectIdSearch },
          { "rolesAndResponsibilities.teamMember": objectIdSearch }
        );
      }
    }

    if (filter?.type === "active") {
      filterQuery.status = "active";
    }

    // 2. Permission Query
    const permissions = new Set();
    
    // Check singular userRole
    if (req.user?.userRole?.active && req.user?.userRole?.permissions) {
        req.user.userRole.permissions.forEach(p => {
             if (p && p.name) permissions.add(p.name);
        });
    }

    // Check plural userRoles
    req.user?.userRoles?.forEach(role => {
        if (role.active && role.permissions) {
            role.permissions.forEach(p => {
                if (p && p.name) permissions.add(p.name);
            });
        }
    });

    const canViewAll = permissions.has('VIEW_ALL_PROJECTS');
    const canViewAssigned = permissions.has('VIEW_PROJECT'); 

    if (!canViewAll && canViewAssigned) {
        // Restrict to projects where user is PM or Team Member
        const ownershipQuery = {
            $or: [
                { projectManager: req.user._id },
                { teamMembers: req.user._id },
                { "rolesAndResponsibilities.teamMember": req.user._id }
            ]
        };
        console.log("DEBUG: Ownership Query constructed:", JSON.stringify(ownershipQuery));
        
        // Merge into filterQuery using $and if other filters exist
        if (Object.keys(filterQuery).length > 0) {
             filterQuery = { $and: [ filterQuery, ownershipQuery ] };
        } else {
             filterQuery = ownershipQuery;
        }
    } else if (!canViewAll && !canViewAssigned) {
         console.log("DEBUG: Permission Denied - No View Access");
         return res.status(200).json(new ApiResponse(200, [], "No projects found (Insufficient permissions)"));
    }
    
    console.log("DEBUG: Final Filter Query:", JSON.stringify(filterQuery, null, 2));

    let query = Project.find(filterQuery);

    let projects = await query
      .populate("projectManager teamMembers rolesAndResponsibilities.teamMember")
      .sort({ _id: sortOrder });

    if (!projects.length) {
      return res.status(200).json(new ApiResponse(200, [], "No projects found"));
    }

    const projectIds = projects.map(p => p._id);
    const allMilestones = await Milestone.find({ project: { $in: projectIds } });

    // Aggregating task stats
    const taskStats = await Task.aggregate([
      { $match: { projectName: { $in: projectIds } } },
      {
        $group: {
          _id: "$projectName",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
          }
        }
      }
    ]);

    const taskStatsMap = taskStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = stat;
      return acc;
    }, {});


    const formattedProjects = projects.map((project) => {
      const teamMembers = project.teamMembers.map((member) => {
        const rolesAndResponsibilities = project.rolesAndResponsibilities
          .filter((role) => role.teamMember?._id.toString() === member._id.toString())
          .map((role) => ({
            role: role.role,
            responsibility: role.responsibility
          }));

        return { ...member.toObject(), rolesAndResponsibilities };
      });

      const projectMilestones = allMilestones
        .filter(m => m.project.toString() === project._id.toString())
        .map(m => m.toObject());

      const stats = taskStatsMap[project._id.toString()] || { totalTasks: 0, completedTasks: 0 };

        return {
          ...project.toObject(),
          teamMembers,
          milestones: projectMilestones,
          taskStats: {
            total: stats.totalTasks,
            completed: stats.completedTasks,
            percentage: project.progress || 0
          }
        };
    });

    return res.status(200).json(new ApiResponse(200, formattedProjects, "Projects fetched successfully"));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(400).json(new ApiError(400, error.message || "Internal Server Error"));
  }
});


import { Sprint } from "../../models/sprint.model.js";

// ... [existing imports]

//delete Project
pc.deleteProject = asyncHandler(async (req, res) => {
  console.log("Req.params", req.params);

  try {
    const { projectId } = req.params;

    if (!projectId || projectId === "undefined") {
      return res.status(400).json(new ApiError(400, "Project ID not provided"));
    }

    // 1. Delete all Tasks associated with the project
    await Task.deleteMany({ projectName: projectId });

    // 2. Delete all Milestones associated with the project
    await Milestone.deleteMany({ project: projectId });

    // 3. Delete all Sprints associated with the project
    await Sprint.deleteMany({ project: projectId });

    // 4. Finally, delete the Project itself
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json(new ApiError(404, "Project not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedProject, "Project and all associated data deleted successfully"));
  } catch (error) {
    console.log("Error------", error);
    return res.status(400).json(new ApiError(400, error.message || "Error deleting project"));
  }
});


export default pc