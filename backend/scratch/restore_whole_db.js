import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

// Default backup directory path
const defaultBackupDir = "/Users/balajiaadesh/Desktop/Sarthi/backend/scratch/db_backup/2026-07-05T13-27-11-162Z";

async function run() {
  const backupDir = process.argv[2] || defaultBackupDir;
  if (!fs.existsSync(backupDir)) {
    console.error(`Error: Backup directory does not exist: ${backupDir}`);
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  const db = mongoose.connection.db;
  const EJSON = mongoose.mongo.BSON.EJSON;

  const metadataPath = path.join(backupDir, "metadata.json");
  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    try {
      metadata = EJSON.parse(fs.readFileSync(metadataPath, "utf8"));
    } catch (e) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    }
    console.log(`Restoring database backup from: ${metadata.timestamp}`);
  }

  const files = fs.readdirSync(backupDir);
  for (const file of files) {
    if (!file.endsWith(".json") || file === "metadata.json") continue;

    const collName = path.basename(file, ".json");
    const filePath = path.join(backupDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    
    let documents;
    try {
      // First try to parse with EJSON to preserve high fidelity types
      documents = EJSON.parse(content);
    } catch (e) {
      // Fallback to normal JSON
      documents = JSON.parse(content);
    }

    console.log(`Restoring collection: ${collName} (${documents.length} docs)...`);
    const collection = db.collection(collName);

    // Clear existing collection
    await collection.deleteMany({});

    if (documents.length > 0) {
      // Ensure all ObjectIds and Dates are restored correctly, supporting both EJSON and old JSON backups
      const docsToInsert = documents.map(doc => convertObjectIds(doc));
      await collection.insertMany(docsToInsert);
    }
    console.log(`  - Restored ${documents.length} documents into ${collName}`);
  }

  console.log("\n=======================================================");
  console.log("Whole database restore completed successfully!");
  console.log("=======================================================\n");
  process.exit(0);
}

function convertObjectIds(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // If it's already an ObjectId or Date instance, return it as is
  if (obj instanceof mongoose.Types.ObjectId || obj instanceof Date) {
    return obj;
  }

  if (typeof obj === 'string') {
    // If it looks like a 24-character hexadecimal ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(obj)) {
      return new mongoose.Types.ObjectId(obj);
    }
    // If it looks like an ISO date string
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertObjectIds);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertObjectIds(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

run().catch(console.error);
