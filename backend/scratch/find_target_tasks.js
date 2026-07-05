import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);

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

  const allBackupTasks = [];

  for (const parent of parents) {
    console.log(`\nParent: "${parent.taskName}" (ID: ${parent._id}, TaskId: ${parent.taskId})`);
    allBackupTasks.push({ ...parent, type: "parent" });

    const children = await Task.find({ parentTask: parent._id }).toArray();
    console.log(`Children found: ${children.length}`);
    for (const child of children) {
      console.log(`  - Child: "${child.taskName}" (ID: ${child._id}, TaskId: ${child.taskId})`);
      allBackupTasks.push({ ...child, type: "child" });
    }
  }

  const backupFilePath = "/Users/balajiaadesh/Desktop/Sarthi/backend/scratch/backup_dsa_tasks_delete.json";
  fs.writeFileSync(backupFilePath, JSON.stringify(allBackupTasks, null, 2), "utf8");
  console.log(`\nSuccessfully backed up ${allBackupTasks.length} tasks to ${backupFilePath}`);

  process.exit();
}

run().catch(console.error);
