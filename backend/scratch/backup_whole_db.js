import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join("/Users/balajiaadesh/Desktop/Sarthi/backend/scratch", "db_backup", timestamp);
  
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Created backup directory: ${backupDir}`);

  const summary = {};

  for (const collInfo of collections) {
    const collName = collInfo.name;
    // Skip system collections if any
    if (collName.startsWith("system.")) continue;

    console.log(`Backing up collection: ${collName}...`);
    const collection = db.collection(collName);
    const documents = await collection.find({}).toArray();

    const filePath = path.join(backupDir, `${collName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), "utf8");
    console.log(`  - Saved ${documents.length} documents to ${collName}.json`);
    summary[collName] = documents.length;
  }

  // Save summary metadata file
  fs.writeFileSync(
    path.join(backupDir, "metadata.json"),
    JSON.stringify({ timestamp, summary, database: "task-management" }, null, 2),
    "utf8"
  );

  console.log("\nBackup summary:");
  console.table(summary);
  console.log(`\nWhole database backup completed successfully in: ${backupDir}`);

  process.exit();
}

run().catch(console.error);
