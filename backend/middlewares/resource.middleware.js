import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to validate resource ownership.
 * Checks if the current user is the owner of the resource or has a specific override permission.
 * 
 * @param {Model} Model - Mongoose model to query
 * @param {string} ownerField - Field in the model that references the user ID (default: 'assignee')
 * @param {string} overridePermission - Optional permission that allows bypassing ownership check (e.g., 'UPDATE_TASK')
 */
export const validateResourceOwnership = (Model, ownerField = 'assignee', overridePermission = null) => {
    return asyncHandler(async (req, res, next) => {
        const resourceId = req.params.id; // Assuming ID is in params
        if (!resourceId) {
            throw new ApiError(400, "Resource ID is required");
        }

        const resource = await Model.findById(resourceId);
        if (!resource) {
            throw new ApiError(404, "Resource not found");
        }

        // Check if user is the owner
        const isOwner = resource[ownerField]?.toString() === req.user._id.toString();

        if (isOwner) {
            req.resource = resource; // Attach resource to req for later use
            return next();
        }

        // Check for override permission if user is not owner
        if (overridePermission) {
             // We need to re-verify permissions since checkPermission middleware might have run before, 
             // but here we are doing a conditional check.
             // However, usually we chain middlewares: checkPermission OR validateOwnership.
             // A better pattern:
             // [checkPermission('UPDATE_TASK'), validateResourceOwnership(Task)] -> This implies BOTH are needed? 
             // No, requirements say: "Employee can only update assigned tasks". 
             // So if they have UPDATE_ASSIGNED_TASK, they can update IF they are assigned.
             // If they have UPDATE_TASK (Manager), they can update ANY.
             
             // Let's refine the logic.
             // This middleware is strictly for "Is Owner?".
             // We can pass `overridePermission` to allow non-owners with that permission.
             
            // To do this efficiently without re-fetching user permissions, we assume `req.user` 
            // has been populated by previous auth middleware or we fetch lightly.
            // Since `req.user` from `verifyJWT` usually only has basic info, we might need to rely on previous context or fetch.
            // But let's assume this middleware is used in conjunction with checkPermission logic or independently.
            
            // Actually, a simpler approach for the specific requirement:
            // "Employee can only update assigned tasks" implies:
            // IF user has UPDATE_TASK (global) -> Allow
            // ELSE IF user has UPDATE_ASSIGNED_TASK AND is owner -> Allow
            // ELSE -> Deny.

            // So this middleware might be too generic. Let's make it specific or flexible.
            // Let's stick to "Resource Ownership" and allow an override check if we can access user permissions.
             
            // For now, let's just checking ownership.
            // If the route is protected by `checkPermission('UPDATE_ASSIGNED_TASK')`, then we use this middleware to ensure they are assigned.
            
            throw new ApiError(403, "Forbidden: You are not the owner of this resource");
        }
        
        throw new ApiError(403, "Forbidden: You are not the owner of this resource");
    });
};

/**
 * specialized middleware for Task Updates based on requirements.
 * Employee: Can update own tasks (status, etc)
 * Manager: Can update any task.
 */
export const canUpdateTask = asyncHandler(async (req, res, next) => {
    // Dynamic import to avoid circular dependencies
    const { User } = await import('../models/user.model.js'); 
    const { Task } = await import('../models/task.model.js');
    
    const userId = req.user._id;
    // Fix: Access taskId via req.params.taskId (as defined in router) or req.params.id fallback
    const taskId = req.params.taskId || req.params.id; 

    if (!taskId) {
        throw new ApiError(400, "Task ID is required");
    }

    // 1. Fetch User Permissions (Optimized: check if already available in req.user from auth middleware?)
    // auth.middleware might have already populated 'userRoles' and 'permissions'.
    // Let's use req.user if available to save a DB call, else fetch.
    let userPermissions = new Set();
    
    if (req.user?.userRoles && req.user.userRoles.length > 0 && req.user.userRoles[0].permissions) {
         // permissions populated
         req.user.userRoles.forEach(role => {
             if (role.permissions && Array.isArray(role.permissions)) {
                 role.permissions.forEach(p => userPermissions.add(p.name));
             }
         });
    } else {
        // Fetch if not available
        const user = await User.findById(userId).populate({
            path: 'userRoles',
            populate: { path: 'permissions' }
        });
        user?.userRoles?.forEach(role => role.permissions?.forEach(p => userPermissions.add(p.name)));
    }

    // 2. Check Global Permission
    if (userPermissions.has('UPDATE_TASK')) {
        return next(); 
    }

    // 3. Check Assigned Permission + Ownership
    // Assuming 'UPDATE_ASSIGNED_TASK' is the granular permission name.
    // Ensure this matches the seed script.
    if (userPermissions.has('UPDATE_ASSIGNED_TASK')) {
        const task = await Task.findById(taskId);
        if (!task) throw new ApiError(404, "Task not found");

        const isAssigned = Array.isArray(task.assignees) 
            ? task.assignees.some(id => id.toString() === userId.toString())
            : task.assignee?.toString() === userId.toString();

        if (isAssigned) {
            return next();
        }
    }

    throw new ApiError(403, "Forbidden: You do not have permission to update this task");
});
