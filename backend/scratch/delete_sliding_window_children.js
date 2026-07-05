import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  const Task = mongoose.connection.collection('tasks');

  // Exact IDs of the 5 targeted child tasks
  const targetIds = [
    new mongoose.Types.ObjectId("69e0c0ff5ff8d3302ac1607a"), // "Revision of Sliding window and two pointers "
    new mongoose.Types.ObjectId("69da68c1faaf4f1fd14b6b3b"), // "Optimal solution code"
    new mongoose.Types.ObjectId("69da68dcfaaf4f1fd14b6cd4"), // "Optimal solution code"
    new mongoose.Types.ObjectId("69da051afaaf4f1fd14b5f57"), // "Python coding practice"
    new mongoose.Types.ObjectId("69d7997c6f815dc6d8e65919")  // "Revision along with coding practice "
  ];

  console.log(`Verifying target tasks in the database...`);
  const tasks = await Task.find({ _id: { $in: targetIds } }).toArray();

  console.log(`Found ${tasks.length} tasks to delete:`);
  for (const t of tasks) {
    console.log(`- "${t.taskName}" (ID: ${t._id}, TaskId: ${t.taskId})`);
  }

  if (tasks.length !== 5) {
    console.error(`Safety error: Expected to find exactly 5 tasks, but found ${tasks.length}. Aborting deletion!`);
    process.exit(1);
  }

  console.log(`\nDeleting tasks...`);
  const result = await Task.deleteMany({ _id: { $in: targetIds } });
  
  console.log(`Successfully deleted ${result.deletedCount} tasks from the database.`);
  process.exit();
}

run().catch(console.error);
