import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join("/Users/balajiaadesh/Desktop/Sarthi/backend/scratch", "db_backup", `${timestamp}_backup`);
  
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Created backup directory: ${backupDir}`);

  const summary = {};
  const EJSON = mongoose.mongo.BSON.EJSON;

  for (const collInfo of collections) {
    const collName = collInfo.name;
    // Skip system collections
    if (collName.startsWith("system.")) continue;

    console.log(`Backing up collection: ${collName}...`);
    const collection = db.collection(collName);
    const documents = await collection.find({}).toArray();

    const filePath = path.join(backupDir, `${collName}.json`);
    // Use EJSON to preserve types like ObjectId and Date exactly
    const serializedData = EJSON.stringify(documents, null, 2);
    fs.writeFileSync(filePath, serializedData, "utf8");
    console.log(`  - Saved ${documents.length} documents to ${collName}.json`);
    summary[collName] = documents.length;
  }

  // Save summary metadata file
  fs.writeFileSync(
    path.join(backupDir, "metadata.json"),
    EJSON.stringify({ timestamp, summary, database: "task-management" }, null, 2),
    "utf8"
  );

  console.log("\n=======================================================");
  console.log("Backup Summary:");
  console.table(summary);
  console.log("=======================================================");
  console.log(`\nWhole database backup completed successfully!`);
  console.log(`Folder path: ${backupDir}`);
  console.log(`To restore this backup, run:`);
  console.log(`node scratch/restore_whole_db.js ${backupDir}`);
  console.log("=======================================================\n");

  process.exit(0);
}

run().catch(console.error);
