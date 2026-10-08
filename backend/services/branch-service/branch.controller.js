import { Branch } from "../../models/branch.model.js";
import { User } from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

import { isSuperAdmin } from "../../middlewares/rbac.middleware.js";

const isUserAdmin = (user) => {
    if (!user) return false;
    return isSuperAdmin(user);
};

const createBranch = asyncHandler(async (req, res) => {
    if (!isUserAdmin(req.user)) {
        throw new ApiError(403, "Forbidden: Only administrators can create canonical Branches/Modules.");
    }

    const { name, description, address, city, country, logo, visibility } = req.body;

    if (!name) {
        throw new ApiError(400, "Branch name is required");
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const existingBranch = await Branch.findOne({ slug });
    if (existingBranch) {
        throw new ApiError(400, "Branch with this name already exists");
    }

    const branch = await Branch.create({
        name,
        slug,
        description,
        address,
        city,
        country,
        logo,
        visibility: visibility || "public",
        createdBy: req.user._id
    });

    // Add access to the creator
    if (!req.user.branchAccess) req.user.branchAccess = [];
    req.user.branchAccess.push({ branchId: branch._id, role: "admin" });
    await req.user.save();

    return res.status(201).json(new ApiResponse(201, branch, "Branch created successfully"));
});

const getBranches = asyncHandler(async (req, res) => {
    const isSuperAdminUser = isSuperAdmin(req.user);
    
    let query = {};
    if (!isSuperAdminUser) {
        const adminUser = process.env.SUPER_ADMIN_GOOGLE_SUB
            ? await User.findOne({
                role: "SUPER_ADMIN",
                googleSub: process.env.SUPER_ADMIN_GOOGLE_SUB,
              }).select("_id")
            : null;
        const adminId = adminUser ? adminUser._id : null;

        const userBranchIds = (req.user?.branchAccess || []).map(b => b.branchId).filter(Boolean);
        const orConditions = [
            { visibility: "public" },
            { createdBy: req.user?._id },
            { _id: { $in: userBranchIds } }
        ];
        if (adminId) {
            orConditions.push({ createdBy: adminId });
        }
        query = { $or: orConditions };
    }
    
    const branches = await Branch.find(query);

    return res.status(200).json(new ApiResponse(200, branches, "Branches fetched successfully"));
});

const getBranchStats = asyncHandler(async (req, res) => {
    const { branchId } = req.params;
    
    const { Project } = await import("../../models/project.model.js");
    const { Task } = await import("../../models/task.model.js");

    const [projectCount, taskCount] = await Promise.all([
        Project.countDocuments({ branchId }),
        Task.countDocuments({ branchId })
    ]);

    return res.status(200).json(new ApiResponse(200, { projectCount, taskCount }, "Stats fetched successfully"));
});

const updateBranch = asyncHandler(async (req, res) => {
    if (!isUserAdmin(req.user)) {
        throw new ApiError(403, "Forbidden: Only administrators can update canonical Branches/Modules.");
    }

    const { branchId } = req.params;
    const { name, description, visibility } = req.body;

    const branch = await Branch.findById(branchId);
    if (!branch) throw new ApiError(404, "Branch not found");

    if (name) {
        branch.name = name;
        branch.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    if (description) branch.description = description;
    
    if (visibility) {
        branch.visibility = visibility;
    }

    await branch.save();

    return res.status(200).json(new ApiResponse(200, branch, "Branch updated successfully"));
});

const deleteBranch = asyncHandler(async (req, res) => {
    if (!isUserAdmin(req.user)) {
        throw new ApiError(403, "Forbidden: Only administrators can delete canonical Branches/Modules.");
    }

    const { branchId } = req.params;
    const { confirmationName } = req.body;

    const branch = await Branch.findById(branchId);
    if (!branch) throw new ApiError(404, "Branch not found");

    if (confirmationName !== branch.name) {
        throw new ApiError(400, "Branch name confirmation does not match");
    }

    // Cascade delete projects and tasks
    const { Project } = await import("../../models/project.model.js");
    const { Task } = await import("../../models/task.model.js");

    await Promise.all([
        Project.deleteMany({ branchId }),
        Task.deleteMany({ branchId }),
        Branch.findByIdAndDelete(branchId)
    ]);

    // Remove from user's branchAccess
    if (req.user.branchAccess) {
        req.user.branchAccess = req.user.branchAccess.filter(access => access.branchId?.toString() !== branchId);
        await req.user.save();
    }

    return res.status(200).json(new ApiResponse(200, null, "Branch deleted successfully"));
});

export const BranchController = {
    createBranch,
    getBranches,
    getBranchStats,
    updateBranch,
    deleteBranch
};
