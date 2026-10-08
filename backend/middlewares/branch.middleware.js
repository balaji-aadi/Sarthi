import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Branch } from "../models/branch.model.js";
import mongoose from "mongoose";

import { isSuperAdmin } from "./rbac.middleware.js";

export const verifyBranchAccess = asyncHandler(async (req, _, next) => {
    const branchId = req.headers["x-branch-id"];

    if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
        console.error("Invalid Branch ID received:", branchId);
        throw new ApiError(400, "Invalid or missing Branch ID in headers");
    }

    const isSuperAdminUser = isSuperAdmin(req.user);
    const hasAccess = req.user?.branchAccess?.some(access => access.branchId?.toString() === branchId);
    
    if (!hasAccess && !isSuperAdminUser) {
        throw new ApiError(403, "You do not have access to this branch");
    }

    req.branchId = branchId;
    next();
});
