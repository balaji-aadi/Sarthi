import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { Project } from "../models/project.model.js";

const checkProjects = async () => {
    try {
        await connectDB();
        console.log("Connected to DB...");

        const userId = "6997fb4757e2e19c7dba7550"; // The user ID from logs
        console.log(`Checking projects for User ID: ${userId}`);

        const projects = await Project.find({});
        console.log(`Total Projects Found: ${projects.length}`);

        const assignedProjects = projects.filter(p => {
            const isManager = p.projectManager?.toString() === userId;
            const isMember = p.teamMembers?.some(m => m.toString() === userId);
            const isRole = p.rolesAndResponsibilities?.some(r => r.teamMember?.toString() === userId);
            
            if (isManager || isMember || isRole) {
                console.log(`- MATCH: Project "${p.name}" (${p._id})`);
                console.log(`  Is Manager: ${isManager}`);
                console.log(`  Is Team Member: ${isMember}`);
                console.log(`  Is in Roles: ${isRole}`);
                return true;
            }
            return false;
        });

        if (assignedProjects.length === 0) {
            console.log("❌ User is NOT assigned to any projects.");
            console.log("This explains why the dashboard is empty.");
        } else {
            console.log(`✅ User is assigned to ${assignedProjects.length} projects.`);
        }

        process.exit(0);

    } catch (error) {
        console.error("Error checking projects:", error);
        process.exit(1);
    }
};

checkProjects();
