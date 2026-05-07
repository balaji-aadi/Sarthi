import "dotenv/config";
import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import connectDB from "../config/db.config.js";

async function listProjects() {
    await connectDB();
    const projects = await Project.find({}, "name key status");
    console.log(JSON.stringify(projects, null, 2));
    process.exit(0);
}

listProjects();
