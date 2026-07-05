import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

// Default backup directory path from the run we just did
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

  const metadataPath = path.join(backupDir, "metadata.json");
  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    console.log(`Restoring database backup from: ${metadata.timestamp}`);
  }

  const files = fs.readdirSync(backupDir);
  for (const file of files) {
    if (!file.endsWith(".json") || file === "metadata.json") continue;

    const collName = path.basename(file, ".json");
    const filePath = path.join(backupDir, file);
    const documents = JSON.parse(fs.readFileSync(filePath, "utf8"));

    console.log(`Restoring collection: ${collName} (${documents.length} docs)...`);
    const collection = db.collection(collName);

    // Clear existing collection
    await collection.deleteMany({});

    if (documents.length > 0) {
      // Map string _id (if serialized as string) back to ObjectId if needed,
      // but mongo driver can insert them. Standard JSON stringify converts ObjectId to string.
      // MongoDB node driver insertMany handles string _id as string unless we convert them back to ObjectId.
      // Wait, Mongoose schema defines _id as ObjectId, so if we insert string _ids it might cause type issues
      // for future queries or references. Let's convert string _id and any object ID fields back to ObjectId!
      const docsToInsert = documents.map(doc => {
        return convertObjectIds(doc);
      });
      await collection.insertMany(docsToInsert);
    }
    console.log(`  - Restored ${documents.length} documents into ${collName}`);
  }

  console.log("\nWhole database restore completed successfully!");
  process.exit();
}

function convertObjectIds(obj) {
  if (obj === null || obj === undefined) {
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
