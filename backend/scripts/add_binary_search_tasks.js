import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const uri = process.env.MONGODB_URI;

const PROJECT_ID = "69d7788e6d3910f342f371d9";
const USER_ID = "6993047f16e85ff3e4efd9a3";
const BRANCH_ID = "6a081b6e111c99b633b00d76";

const questionsPartition = [
  {
    date: "2026-06-16T00:00:00Z",
    tasks: [
      "Find First and Last Position of Element in Sorted Array",
      "Search in Rotated Sorted Array",
      "Find Minimum in Rotated Sorted Array"
    ]
  },
  {
    date: "2026-06-17T00:00:00Z",
    tasks: [
      "Koko Eating Bananas",
      "Capacity to Ship Packages Within D Days"
    ]
  },
  {
    date: "2026-06-18T00:00:00Z",
    tasks: [
      "Minimum Days to Make m Bouquets",
      "Aggressive Cows"
    ]
  },
  {
    date: "2026-06-19T00:00:00Z",
    tasks: [
      "Split Array Largest Sum",
      "Magnetic Force Between Two Balls",
      "Median of Two Sorted Arrays"
    ]
  }
];

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const Task = mongoose.connection.collection('tasks');

    // Find current max taskId for DSA
    const dsaTasks = await Task.find({ taskId: { $regex: /^DSA-/ } }).toArray();
    let maxId = 0;
    dsaTasks.forEach(t => {
      const num = parseInt(t.taskId.split('-')[1]);
      if (num > maxId) maxId = num;
    });
    let taskIdCounter = maxId + 1;
    console.log(`Starting task ID counter from: DSA-${taskIdCounter}`);

    const totalChildren = 10;

    // Create Parent Task
    const parentTask = {
      projectName: new mongoose.Types.ObjectId(PROJECT_ID),
      taskName: "Binary search",
      taskId: `DSA-${taskIdCounter++}`,
      taskPriority: "high",
      taskType: "preparation",
      taskStartDate: new Date("2026-06-16T00:00:00Z"),
      taskDueDate: new Date("2026-06-20T00:00:00Z"),
      estimatedHours: totalChildren * 1.5,
      storyPoints: 0,
      progress: 0,
      status: "todo",
      assignee: new mongoose.Types.ObjectId(USER_ID),
      createdBy: new mongoose.Types.ObjectId(USER_ID),
      parentTask: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtaskStats: { total: totalChildren, completed: 0 },
      branchId: new mongoose.Types.ObjectId(BRANCH_ID)
    };

    const parentResult = await Task.insertOne(parentTask);
    const parentId = parentResult.insertedId;
    console.log(`Inserted Parent Task: "Binary search" with ID: ${parentTask.taskId}`);

    // Create Child Tasks
    for (const group of questionsPartition) {
      const childDate = new Date(group.date);
      for (const questionName of group.tasks) {
        const childTask = {
          projectName: new mongoose.Types.ObjectId(PROJECT_ID),
          taskName: questionName,
          taskId: `DSA-${taskIdCounter++}`,
          taskPriority: "medium",
          taskType: "preparation",
          taskStartDate: childDate,
          taskDueDate: childDate,
          estimatedHours: 1.5,
          storyPoints: 0,
          progress: 0,
          status: "todo",
          assignee: new mongoose.Types.ObjectId(USER_ID),
          createdBy: new mongoose.Types.ObjectId(USER_ID),
          parentTask: parentId,
          createdAt: new Date(),
          updatedAt: new Date(),
          branchId: new mongoose.Types.ObjectId(BRANCH_ID)
        };

        await Task.insertOne(childTask);
        console.log(`  Inserted Child Task: "${questionName}" with ID: ${childTask.taskId} for Date: ${group.date.split('T')[0]}`);
      }
    }

    console.log("All tasks inserted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error running script:", error);
    process.exit(1);
  }
}

run();
