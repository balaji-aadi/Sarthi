import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);

  const Task = mongoose.connection.collection('tasks');
  const parentId = new mongoose.Types.ObjectId("69e75051c05bf5f0580b8059");
  
  const allTasks = await Task.find({
     $or: [
        { _id: parentId },
        { parentTask: parentId },
        { parentTask: parentId.toString() }
     ]
  }).toArray();

  console.log("All tasks for KMP parent / children in DB:");
  for (const t of allTasks) {
    console.log(`- Task Name: "${t.taskName}"`);
    console.log(`  ID: ${t._id}`);
    console.log(`  Status: ${t.status}`);
    console.log(`  ParentTask: ${t.parentTask}`);
  }
  process.exit();
}
run();
