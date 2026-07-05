import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  const Task = mongoose.connection.collection('tasks');

  // Exact names in database
  const targetParentNames = [
    "Backtracking (STRINGS)",
    "Trie",
    "String Matching (KMP etc.)"
  ];

  const parents = await Task.find({
    taskName: { $in: targetParentNames }
  }).toArray();

  console.log(`Found ${parents.length} matching parent tasks.`);

  const allTaskIdsToDelete = [];
  const taskDetails = [];

  for (const parent of parents) {
    allTaskIdsToDelete.push(parent._id);
    taskDetails.push({ id: parent._id, name: parent.taskName, type: "parent" });

    const children = await Task.find({ parentTask: parent._id }).toArray();
    console.log(`- Parent "${parent.taskName}" has ${children.length} children.`);
    for (const child of children) {
      allTaskIdsToDelete.push(child._id);
      taskDetails.push({ id: child._id, name: child.taskName, type: "child" });
    }
  }

  const expectedCount = 33;
  if (allTaskIdsToDelete.length !== expectedCount) {
    console.error(`Safety error: Expected exactly ${expectedCount} tasks to delete, but found ${allTaskIdsToDelete.length}. Aborting deletion!`);
    process.exit(1);
  }

  console.log(`\nDeleting ${allTaskIdsToDelete.length} tasks...`);
  const result = await Task.deleteMany({ _id: { $in: allTaskIdsToDelete } });
  
  console.log(`Successfully deleted ${result.deletedCount} tasks from the database.`);
  console.log("\nDeleted tasks details:");
  taskDetails.forEach(t => {
    console.log(`- [${t.type.toUpperCase()}] ${t.name} (ID: ${t.id})`);
  });

  process.exit();
}

run().catch(console.error);
