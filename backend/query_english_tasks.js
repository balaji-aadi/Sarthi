import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection.db;

  // Find project
  const Project = mongoose.connection.collection('projects');
  const allProjects = await Project.find({}).toArray();
  const englishProject = allProjects.find(p => p.name.toLowerCase().includes('english'));

  if (!englishProject) {
    console.log("No English project found:");
    console.log(allProjects.map(p => ({ id: p._id, name: p.name, key: p.key })));
    process.exit(1);
  }

  console.log("Found Project:", englishProject.name, englishProject._id, englishProject.key);

  const Task = mongoose.connection.collection('tasks');
  const tasks = await Task.find({ projectName: englishProject._id }).toArray();
  
  console.log(`Found ${tasks.length} tasks in ${englishProject.name}`);
  for (const t of tasks) {
    console.log(`- ${t.taskName} (ID: ${t.taskId}, Date: ${t.createdAt}, parent: ${t.parentTask})`);
  }

  process.exit(0);
}

run().catch(console.error);
