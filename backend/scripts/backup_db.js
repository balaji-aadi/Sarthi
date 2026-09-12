import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function backupDatabase() {
  console.log("=================================================================");
  console.log("       SARTHI DATABASE SNAPSHOT & FULL BACKUP ENGINE             ");
  console.log("=================================================================\n");
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✓ Connected successfully.");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  const now = new Date();
  const timestampStr = now.toISOString().replace(/[:.]/g, "-");
  
  // 1. Root-level database_backups directory
  const rootBackupDir = path.join(process.cwd(), "..", "database_backups");
  const timestampedBackupDir = path.join(rootBackupDir, `backup_${timestampStr}`);
  const latestBackupDir = path.join(rootBackupDir, "LATEST");

  // 2. Backend-level database_backup directory
  const backendBackupDir = path.join(process.cwd(), "database_backup");
  const backendTimestampDir = path.join(process.cwd(), `database_backup_${timestampStr}`);

  const targetDirs = [timestampedBackupDir, latestBackupDir, backendBackupDir, backendTimestampDir];
  for (const dir of targetDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`\nCreated backup target directories:`);
  console.log(`  -> Root Snapshot:   ${timestampedBackupDir}`);
  console.log(`  -> Root LATEST:     ${latestBackupDir}`);
  console.log(`  -> Backend Folder:  ${backendBackupDir}\n`);

  const summary = {};
  let totalDocs = 0;
  const EJSON = mongoose.mongo.BSON.EJSON;

  for (const collInfo of collections) {
    const collName = collInfo.name;
    if (collName.startsWith("system.")) continue; // Skip MongoDB internal system collections

    const collection = db.collection(collName);
    const documents = await collection.find({}).toArray();
    const indexes = await collection.indexes();

    // Canonical Extended JSON ensures exact 100% preservation of ObjectIds, Dates, Longs, BinData
    const serializedData = EJSON.stringify(documents, { relaxed: false }, 2);
    const serializedIndexes = JSON.stringify(indexes, null, 2);

    for (const dir of targetDirs) {
      fs.writeFileSync(path.join(dir, `${collName}.json`), serializedData, "utf8");
      fs.writeFileSync(path.join(dir, `${collName}.indexes.json`), serializedIndexes, "utf8");
    }

    console.log(`  ✓ Saved ${documents.length} docs & ${indexes.length} indexes for [${collName}]`);
    summary[collName] = {
      count: documents.length,
      indexes: indexes.length,
      sizeKb: (Buffer.byteLength(serializedData) / 1024).toFixed(2)
    };
    totalDocs += documents.length;
  }

  const metaData = {
    timestamp: now.toISOString(),
    database: db.databaseName,
    totalCollections: Object.keys(summary).length,
    totalDocuments: totalDocs,
    collections: summary
  };

  const metaJson = JSON.stringify(metaData, null, 2);
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, "metadata.json"), metaJson, "utf8");
  }

  await mongoose.disconnect();

  console.log("\n=================================================================");
  console.log("                 FULL DATABASE BACKUP SUMMARY                    ");
  console.log("=================================================================");
  console.table(
    Object.entries(summary).map(([name, data]) => ({
      Collection: name,
      Documents: data.count,
      Indexes: data.indexes,
      "Size (KB)": data.sizeKb
    }))
  );
  console.log(`  Total Collections Backed Up: ${Object.keys(summary).length}`);
  console.log(`  Total Documents Saved:       ${totalDocs}`);
  console.log("=================================================================");
  console.log(`\nPrimary Backup Location: ${latestBackupDir}`);
  console.log(`Timestamp Archive:       ${timestampedBackupDir}`);
  console.log("\nTo restore this full database backup at any time, run:");
  console.log("  npm run db:restore");
  console.log("  OR: node scripts/restore_db.js");
  console.log("=================================================================\n");

  process.exit(0);
}

backupDatabase().catch(err => {
  console.error("FATAL DATABASE BACKUP ERROR:", err);
  process.exit(1);
});
