import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";

dotenv.config();

const assignTasks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected.");

        // Find primary user
        const user = await User.findOne({ firstName: /Balaji/i });
        if (!user) {
            console.error("User Balaji not found!");
            process.exit(1);
        }
        console.log(`Found User: ${user.firstName} ${user.lastName} (ID: ${user._id})`);

        // Find all tasks with null/undefined assignee
        const unassignedTasks = await Task.find({
            $or: [
                { assignee: null },
                { assignee: { $exists: false } }
            ]
        });

        console.log(`Found ${unassignedTasks.length} unassigned tasks.`);

        if (unassignedTasks.length > 0) {
            const result = await Task.updateMany(
                {
                    $or: [
                        { assignee: null },
                        { assignee: { $exists: false } }
                    ]
                },
                {
                    $set: { assignee: user._id }
                }
            );
            console.log(`Successfully updated tasks. Result:`, result);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error during task assignment:", error);
        process.exit(1);
    }
};

assignTasks();
