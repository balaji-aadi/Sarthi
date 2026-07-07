import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  const projectId = new mongoose.Types.ObjectId("69d77b7c6d3910f342f3762e");
  const tasks = await db.collection("tasks").find({ projectName: projectId }).toArray();
  const taskIds = tasks.map(t => t._id);

  console.log(`Analyzing dependencies for Project ID: ${projectId} and ${taskIds.length} tasks...`);

  // 1. Check notes
  const notesWithTask = await db.collection("notes").find({
    $or: [
      { taskId: { $in: taskIds } },
      { taskIds: { $in: taskIds } }
    ]
  }).toArray();
  console.log(`- Notes referencing these tasks: ${notesWithTask.length}`);
  notesWithTask.forEach(n => console.log(`  Note ID: ${n._id}, Title: ${n.title}`));

  // 2. Check activities
  const activitiesWithTask = await db.collection("activities").find({
    referenceId: { $in: taskIds }
  }).toArray();
  console.log(`- Activities referencing these tasks: ${activitiesWithTask.length}`);
  activitiesWithTask.forEach(a => console.log(`  Activity ID: ${a._id}, Summary: ${a.summary}`));

  // 3. Check focus sessions
  const sessionsWithTask = await db.collection("focussessions").find({
    task: { $in: taskIds }
  }).toArray();
  console.log(`- Focus sessions referencing these tasks: ${sessionsWithTask.length}`);
  sessionsWithTask.forEach(s => console.log(`  Session ID: ${s._id}, taskName: ${s.taskName}`));

  // 4. Check bugs
  const bugsWithProject = await db.collection("bugs").find({
    projectId: projectId
  }).toArray();
  console.log(`- Bugs referencing project: ${bugsWithProject.length}`);

  // 5. Check epics
  const epicsWithProject = await db.collection("epics").find({
    project: projectId
  }).toArray();
  console.log(`- Epics referencing project: ${epicsWithProject.length}`);

  // 6. Check sprints
  const sprintsWithProject = await db.collection("sprints").find({
    projectId: projectId
  }).toArray();
  console.log(`- Sprints referencing project: ${sprintsWithProject.length}`);

  // 7. Check milestones
  const milestonesWithProject = await db.collection("milestones").find({
    projectId: projectId
  }).toArray();
  console.log(`- Milestones referencing project: ${milestonesWithProject.length}`);

  process.exit(0);
}

run().catch(console.error);
