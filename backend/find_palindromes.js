import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);

  const Task = mongoose.connection.collection('tasks');
  const tasks = await Task.find({
    taskName: { $regex: /palindrome/i }
  }).toArray();

  console.log("Found Tasks:", tasks.map(t => ({
    id: t._id,
    taskName: t.taskName,
    parentTask: t.parentTask,
    status: t.status
  })));

  process.exit();
}
run();
