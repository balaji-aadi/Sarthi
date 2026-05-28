import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Branch } from "../models/branch.model.js";
import mongoose from "mongoose";

export const verifyBranchAccess = asyncHandler(async (req, _, next) => {
    const branchId = req.headers["x-branch-id"];

    if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
        console.error("Invalid Branch ID received:", branchId);
        throw new ApiError(400, "Invalid or missing Branch ID in headers");
    }

    // Check if user has access to this branch
    // Admin (Balaji) bypasses check for initial setup/testing
    const isSuperAdmin = req.user?.email === "balajiaadi2000@gmail.com";
    
    const hasAccess = req.user?.branchAccess?.some(access => access.branchId?.toString() === branchId);
    
    if (!hasAccess && !isSuperAdmin) {
        throw new ApiError(403, "You do not have access to this branch");
    }

    req.branchId = branchId;
    next();
});
