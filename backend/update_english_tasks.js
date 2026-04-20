import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);

  const Project = mongoose.connection.collection('projects');
  const englishProject = await Project.findOne({ name: /english/i });
  console.log("PROJECT:", englishProject);

  const Task = mongoose.connection.collection('tasks');
  const tasks = await Task.find({ projectName: englishProject._id }).toArray();
  
  if (!englishProject.key) {
      console.log("Setting key ENG to project...");
      await Project.updateOne({ _id: englishProject._id }, { $set: { key: "ENG" } });
  }

  // Create parent task
  const newParentTask = {
      projectName: englishProject._id,
      taskName: "English By Udisha Ma'am",
      taskPriority: "medium",
      taskType: "Course",
      status: "todo",
      createdAt: new Date("2026-05-05T00:00:00Z"),
      updatedAt: new Date(),
      subtaskStats: {
        total: tasks.length,
        completed: 0
      }
  };

  const insertResult = await Task.insertOne(newParentTask);
  const parentId = insertResult.insertedId;

  console.log("Created Parent Task with ID:", parentId);

  let counter = 1;

  for (const t of tasks) {
    let updates = { parentTask: parentId };
    
    // update task ID if missing
    if (!t.taskId) {
        updates.taskId = `ENG-${counter}`;
        counter++;
    }

    await Task.updateOne({ _id: t._id }, { $set: updates });
  }

  console.log("Updated", tasks.length, "tasks to be children and set their taskIds!");

  // Assign ENG prefix to newParentTask
  await Task.updateOne({ _id: parentId }, { $set: { taskId: `ENG-${counter}` } });
  console.log("Set Parent taskId to:", `ENG-${counter}`);

  process.exit(0);
}

run().catch(console.error);
