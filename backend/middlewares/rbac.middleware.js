import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { UserRole } from '../models/role.model.js';
import { User } from '../models/user.model.js'; // Ensure correct import

/**
 * Middleware to check if the user has the required permission.
 * @param {string} requiredPermission - The name of the permission required (e.g., 'CREATE_PROJECT')
 */
export const checkPermission = (requiredPermission) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "Unauthorized: User not authenticated");
        }

        // Fetch user withroles and their permissions
        // Note: adjust the populate path based on your User model 
        const user = await User.findById(req.user._id)
            .populate({
                path: 'userRoles', 
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            })
            // Fallback for single role if userRoles is empty/not used yet?
            .populate({
                path: 'userRole',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            });

        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }

        // Collect all roles and permissions
        const userPermissions = new Set();
        const userRoleNames = new Set();

        // 1. Check userRoles array (new structure)
        if (user.userRoles && user.userRoles.length > 0) {
            user.userRoles.forEach(role => {
                if (role.active) {
                    userRoleNames.add(role.name.toLowerCase());
                    if (role.permissions) {
                        role.permissions.forEach(perm => {
                            userPermissions.add(perm.name);
                        });
                    }
                }
            });
        }

        // 2. Check single userRole (legacy/fallback)
        if (user.userRole && user.userRole.active) {
            userRoleNames.add(user.userRole.name.toLowerCase());
            if (user.userRole.permissions) {
                user.userRole.permissions.forEach(perm => {
                    userPermissions.add(perm.name);
                });
            }
        }
        
        // ADMIN bypass
        if (userRoleNames.has('admin') || userRoleNames.has('projectmanager') && Array.isArray(requiredPermission) && requiredPermission.includes('VIEW_TASK')) {
            // Optional: stricter PM check if needed, but for now admin/PM often have broad view
        }
        
        if (userRoleNames.has('admin')) {
            return next();
        }

        // Check permissions
        const hasPermission = Array.isArray(requiredPermission)
            ? requiredPermission.some(perm => userPermissions.has(perm))
            : userPermissions.has(requiredPermission);

        if (hasPermission) {
            return next();
        } else {
            throw new ApiError(403, `Forbidden: You do not have permission to ${Array.isArray(requiredPermission) ? requiredPermission.join(' or ') : requiredPermission}`);
        }
    });
};
