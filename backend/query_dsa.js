import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);

  const Project = mongoose.connection.collection('projects');
  const dsaProject = await Project.findOne({ name: /Data Structure/i });
  console.log("PROJECT:", dsaProject.name);

  const Task = mongoose.connection.collection('tasks');
  const tasks = await Task.find({ projectName: dsaProject._id }).toArray();

  for (const t of tasks) {
    console.log(`- ${t.taskName} (ID: ${t.taskId}, Date: ${t.createdAt}, Parent: ${t.parentTask})`);
  }
  process.exit();
}
run();
