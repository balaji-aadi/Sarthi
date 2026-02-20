import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { Permission } from "../models/permission.model.js";
import { UserRole, ROLES } from "../models/role.model.js";

const permissions = [
  // Project Permissions
  { name: "CREATE_PROJECT", module: "PROJECT", description: "Create a new project" },
  { name: "UPDATE_PROJECT", module: "PROJECT", description: "Update existing project details" },
  { name: "DELETE_PROJECT", module: "PROJECT", description: "Delete a project" },
  { name: "VIEW_PROJECT", module: "PROJECT", description: "View project details" },
  { name: "VIEW_ALL_PROJECTS", module: "PROJECT", description: "View all projects" },

  // Milestone Permissions
  { name: "CREATE_MILESTONE", module: "MILESTONE", description: "Create a milestone" },
  { name: "UPDATE_MILESTONE", module: "MILESTONE", description: "Update a milestone" },
  { name: "DELETE_MILESTONE", module: "MILESTONE", description: "Delete a milestone" },

  // Task Permissions
  { name: "CREATE_TASK", module: "TASK", description: "Create a task" },
  { name: "UPDATE_TASK", module: "TASK", description: "Update any task" },
  { name: "DELETE_TASK", module: "TASK", description: "Delete a task" },
  { name: "ASSIGN_TASK", module: "TASK", description: "Assign task to user" },
  { name: "CHANGE_STATUS", module: "TASK", description: "Change task status" }, // Generic change status
  { name: "VIEW_TASK", module: "TASK", description: "View task details" },
  { name: "VIEW_ASSIGNED_TASK", module: "TASK", description: "View only assigned tasks" },
  { name: "UPDATE_ASSIGNED_TASK", module: "TASK", description: "Update only assigned tasks" },

  // Sprint Permissions
  { name: "CREATE_SPRINT", module: "SPRINT", description: "Create a sprint" },
  { name: "START_SPRINT", module: "SPRINT", description: "Start a sprint" },
  { name: "COMPLETE_SPRINT", module: "SPRINT", description: "Complete a sprint" },

  // User Management Permissions
  { name: "CREATE_USER", module: "USER", description: "Create a new user" },
  { name: "UPDATE_USER", module: "USER", description: "Update user details" },
  { name: "ASSIGN_ROLE", module: "USER", description: "Assign roles to users" },
];

const roleMappings = {
  [ROLES.ADMIN]: permissions.map(p => p.name), // Admin gets all permissions
  [ROLES.PROJECT_MANAGER]: [
    "CREATE_PROJECT", "UPDATE_PROJECT", "VIEW_ALL_PROJECTS", "VIEW_PROJECT",
    "CREATE_MILESTONE", "UPDATE_MILESTONE", "DELETE_MILESTONE",
    "CREATE_SPRINT", "START_SPRINT", "COMPLETE_SPRINT",
    "CREATE_TASK", "ASSIGN_TASK", "CHANGE_STATUS", "VIEW_TASK", "UPDATE_TASK", "DELETE_TASK"
  ],
  [ROLES.HR]: [
    "VIEW_PROJECT", "VIEW_TASK",
    "CREATE_USER", "UPDATE_USER", "ASSIGN_ROLE" // HR manages users
  ],
  [ROLES.EMPLOYEE]: [
    "VIEW_PROJECT",
    "VIEW_ASSIGNED_TASK", "UPDATE_ASSIGNED_TASK", "CHANGE_STATUS" // Can update own task status but NOT full details if we enforce it elsewhere
  ]
};

const seedRBAC = async () => {
    try {
        await connectDB();
        console.log("Connected to DB for seeding...");

        // 1. Upsert Permissions
        const permissionDocs = {};
        for (const perm of permissions) {
            const doc = await Permission.findOneAndUpdate(
                { name: perm.name },
                perm,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            permissionDocs[perm.name] = doc._id;
            console.log(`Synced Permission: ${perm.name}`);
        }

        // 2. Upsert Roles with Permissions
        for (const [roleName, permNames] of Object.entries(roleMappings)) {
            const rolePermissionIds = permNames
                .map(name => permissionDocs[name])
                .filter(id => id); // Filter out undefined if any typo

            const role = await UserRole.findOneAndUpdate(
                { name: roleName },
                { 
                    name: roleName,
                    permissions: rolePermissionIds,
                    active: true
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`Synced Role: ${roleName} with ${role.permissions.length} permissions`);
        }
        
        console.log("RBAC Seeding Completed Successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Error seeding RBAC:", error);
        process.exit(1);
    }
};

seedRBAC();
