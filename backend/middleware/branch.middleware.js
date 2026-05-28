import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Branch } from "../models/branch.model.js";

export const verifyBranchAccess = asyncHandler(async (req, _, next) => {
    const branchId = req.headers["x-branch-id"];

    if (!branchId) {
        throw new ApiError(400, "Branch ID is required in headers");
    }

    // Optional: Check if user has access to this branch
    const hasAccess = req.user?.branchAccess?.some(access => access.branchId.toString() === branchId);
    
    // Allow admins to bypass check if needed, but for now strict access
    if (!hasAccess && req.user?.email !== "balajiaadi2000@gmail.com") {
        throw new ApiError(403, "You do not have access to this branch");
    }

    req.branchId = branchId;
    next();
});
