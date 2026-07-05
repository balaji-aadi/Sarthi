import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  const Task = mongoose.connection.collection('tasks');

  // Find parent task "Hashing & Anagram (STRINGS)"
  const parent = await Task.findOne({ taskName: "Hashing & Anagram (STRINGS)" });
  if (!parent) {
    console.error("Parent task 'Hashing & Anagram (STRINGS)' not found!");
    process.exit(1);
  }

  console.log("Found Parent Task:");
  console.log(JSON.stringify(parent, null, 2));

  // Find all children
  const children = await Task.find({ parentTask: parent._id }).toArray();
  console.log(`\nFound ${children.length} child tasks:`);
  for (const child of children) {
    console.log(`- "${child.taskName}" (ID: ${child._id}, TaskId: ${child.taskId}, Status: ${child.status})`);
  }

  process.exit();
}

run().catch(console.error);
