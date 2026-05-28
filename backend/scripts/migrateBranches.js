import mongoose from "mongoose";
import dotenv from "dotenv";
import { Branch } from "../models/branch.model.js";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { FocusSession } from "../models/focusSession.model.js";
import { PerformanceStat } from "../models/performanceStat.model.js";

dotenv.config({ path: "./.env" });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Create Default Branch
        let softwareBranch = await Branch.findOne({ slug: "software-development" });
        if (!softwareBranch) {
            softwareBranch = await Branch.create({
                name: "Software Development",
                slug: "software-development",
                description: "Primary branch for software engineering and development tasks.",
                isActive: true
            });
            console.log("Created Software Development branch");
        } else {
            console.log("Software Development branch already exists");
        }

        const branchId = softwareBranch._id;

        // 2. Update Users
        const users = await User.find({});
        for (const user of users) {
            const hasAccess = user.branchAccess.some(access => access.branchId.equals(branchId));
            if (!hasAccess) {
                user.branchAccess.push({ branchId, role: "admin" });
                await user.save();
            }
        }
        console.log(`Updated ${users.length} users with branch access`);

        // 3. Update Projects (Arenas)
        const projectResult = await Project.updateMany(
            { branchId: { $exists: false } },
            { $set: { branchId: branchId } }
        );
        console.log(`Updated ${projectResult.modifiedCount} projects`);

        // 4. Update Tasks
        const taskResult = await Task.updateMany(
            { branchId: { $exists: false } },
            { $set: { branchId: branchId } }
        );
        console.log(`Updated ${taskResult.modifiedCount} tasks`);

        // 5. Update Focus Sessions
        const sessionResult = await FocusSession.updateMany(
            { branchId: { $exists: false } },
            { $set: { branchId: branchId } }
        );
        console.log(`Updated ${sessionResult.modifiedCount} focus sessions`);

        // 6. Update Performance Stats
        const statsResult = await PerformanceStat.updateMany(
            { branchId: { $exists: false } },
            { $set: { branchId: branchId } }
        );
        console.log(`Updated ${statsResult.modifiedCount} performance stats`);

        console.log("Migration completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
