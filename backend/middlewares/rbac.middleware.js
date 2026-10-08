import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';

/**
 * Checks whether a user is the authoritative Super Admin.
 * Strictly anchored to:
 * 1. process.env.SUPER_ADMIN_GOOGLE_SUB (must be configured, otherwise fails closed)
 * 2. user.googleSub matches SUPER_ADMIN_GOOGLE_SUB
 * 3. user.role === 'SUPER_ADMIN'
 */
export const isSuperAdmin = (user) => {
  if (!user) return false;

  const configuredAdminSub = process.env.SUPER_ADMIN_GOOGLE_SUB;
  // Fail closed: If Super Admin identity is not configured, no one is Super Admin
  if (!configuredAdminSub) return false;

  return Boolean(
    user.googleSub &&
    user.googleSub === configuredAdminSub &&
    user.role === "SUPER_ADMIN"
  );
};

/**
 * Middleware that strictly restricts route access to Super Admin.
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json(new ApiError(401, "Unauthorized: Authentication required"));
  }
  if (!isSuperAdmin(req.user)) {
    return res.status(403).json(new ApiError(403, "Forbidden: Super Admin access required"));
  }
  next();
};

/**
 * Middleware to check if the user has the required permission or is Super Admin.
 * @param {string|string[]} requiredPermission - The name(s) of the required permission(s)
 */
export const checkPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user._id) {
      throw new ApiError(401, "Unauthorized: User not authenticated");
    }

    if (isSuperAdmin(req.user)) {
      return next();
    }

    // Fetch user with roles and their permissions if not already populated
    let user = req.user;
    if (!user.userRoles && !user.userRole) {
      user = await User.findById(req.user._id)
        .populate({
          path: 'userRoles',
          populate: {
            path: 'permissions',
            model: 'Permission',
          },
        })
        .populate({
          path: 'userRole',
          populate: {
            path: 'permissions',
            model: 'Permission',
          },
        });
    }

    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    const userPermissions = new Set();
    const userRoleNames = new Set();

    if (user.userRoles && user.userRoles.length > 0) {
      user.userRoles.forEach((role) => {
        if (role && role.active !== false) {
          if (role.name) userRoleNames.add(role.name.toLowerCase());
          if (role.permissions) {
            role.permissions.forEach((perm) => {
              if (perm && perm.name) userPermissions.add(perm.name);
            });
          }
        }
      });
    }

    if (user.userRole && user.userRole.active !== false) {
      if (user.userRole.name) userRoleNames.add(user.userRole.name.toLowerCase());
      if (user.userRole.permissions) {
        user.userRole.permissions.forEach((perm) => {
          if (perm && perm.name) userPermissions.add(perm.name);
        });
      }
    }

    if (userRoleNames.has('admin')) {
      return next();
    }

    const hasPermission = Array.isArray(requiredPermission)
      ? requiredPermission.some((perm) => userPermissions.has(perm))
      : userPermissions.has(requiredPermission);

    if (hasPermission) {
      return next();
    } else {
      throw new ApiError(
        403,
        `Forbidden: You do not have permission to ${
          Array.isArray(requiredPermission) ? requiredPermission.join(' or ') : requiredPermission
        }`
      );
    }
  });
};
