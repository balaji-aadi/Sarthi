import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.config.js";
import { Branch } from "./models/branch.model.js";
import { Project } from "./models/project.model.js";
import { Task } from "./models/task.model.js";
import Problem from "./models/problem.model.js";
import { User } from "./models/user.model.js";
import Company from "./models/company.model.js";
import Topic from "./models/topic.model.js";
import Pattern from "./models/pattern.model.js";

async function audit() {
  await connectDB();
  console.log("Connected to MongoDB");

  // 1. Branches
  const branches = await Branch.find({}).lean();
  console.log("\n=== BRANCHES ===");
  branches.forEach(b => console.log(`- ${b.name} (_id: ${b._id}, code: ${b.code})`));

  // 2. Projects
  const projects = await Project.find({}).lean();
  console.log("\n=== PROJECTS ===");
  for (const p of projects) {
    const count = await Task.countDocuments({ projectName: p._id });
    console.log(`- ${p.name} (Key: ${p.key}, _id: ${p._id}, branchId: ${p.branchId}, tasks: ${count})`);
  }

  // 3. Problem collection count
  const problemCount = await Problem.countDocuments({});
  console.log(`\n=== PROBLEMS COLLECTION COUNT: ${problemCount} ===`);
  if (problemCount > 0) {
    const problems = await Problem.find({}).select("problemCode title slug difficulty status problemType").lean();
    console.log("Sample problems in Problem collection:");
    problems.slice(0, 10).forEach(pr => console.log(`  [${pr.problemCode}] ${pr.title} (${pr.difficulty}, ${pr.status}, ${pr.problemType})`));
  }

  // 4. Total tasks in Task collection
  const totalTasks = await Task.countDocuments({});
  console.log(`\n=== TOTAL TASKS IN DB: ${totalTasks} ===`);

  // 5. DSA Tasks in Task collection
  // Find DSA projects
  const dsaProjects = projects.filter(p => 
    /dsa/i.test(p.name) || /dsa/i.test(p.key || '') || /data structure/i.test(p.name)
  );
  console.log(`\n=== DSA PROJECTS IDENTIFIED: ${dsaProjects.length} ===`);
  dsaProjects.forEach(p => console.log(`  - ${p.name} (_id: ${p._id})`));

  const dsaProjectIds = dsaProjects.map(p => p._id);
  const dsaTasks = await Task.find({ 
    $or: [
      { projectName: { $in: dsaProjectIds } },
      { taskId: /^DSA/i }
    ]
  }).populate("parentTask", "taskName taskId").lean();

  console.log(`\n=== TOTAL DSA TASKS FOUND: ${dsaTasks.length} ===`);

  // Breakdown of parents (Topics) vs children (Problems)
  const parentTasks = dsaTasks.filter(t => !t.parentTask);
  const childTasks = dsaTasks.filter(t => t.parentTask);
  console.log(`DSA Parent/Root nodes (Topics/Phases): ${parentTasks.length}`);
  console.log(`DSA Child nodes (Problems/Questions): ${childTasks.length}`);

  process.exit(0);
}

audit().catch(e => {
  console.error(e);
  process.exit(1);
});
