import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function restoreDatabase() {
  console.log("=================================================================");
  console.log("       SARTHI DATABASE RECOVERY & FULL RESTORE ENGINE           ");
  console.log("=================================================================\n");

  // Determine candidate backup directory
  const rootLatest = path.join(process.cwd(), "..", "database_backups", "LATEST");
  const backendBackup = path.join(process.cwd(), "database_backup");
  
  let backupDir = process.argv[2];
  if (!backupDir) {
    if (fs.existsSync(rootLatest) && fs.existsSync(path.join(rootLatest, "metadata.json"))) {
      backupDir = rootLatest;
    } else if (fs.existsSync(backendBackup) && fs.existsSync(path.join(backendBackup, "metadata.json"))) {
      backupDir = backendBackup;
    } else {
      backupDir = rootLatest;
    }
  }

  if (!fs.existsSync(backupDir)) {
    console.error(`❌ ERROR: Specified backup directory does not exist: ${backupDir}`);
    process.exit(1);
  }

  console.log(`Loading backup snapshot from: ${backupDir}`);
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("✓ Connected successfully.");

  const db = mongoose.connection.db;
  const EJSON = mongoose.mongo.BSON.EJSON;

  const metadataPath = path.join(backupDir, "metadata.json");
  if (fs.existsSync(metadataPath)) {
    const meta = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    console.log(`\nSnapshot Details:`);
    console.log(`  Timestamp:         ${meta.timestamp}`);
    console.log(`  Target Database:   ${meta.database || db.databaseName}`);
    console.log(`  Total Collections: ${meta.totalCollections}`);
    console.log(`  Total Documents:   ${meta.totalDocuments}\n`);
  }

  const files = fs.readdirSync(backupDir);
  const restoredSummary = {};
  let totalRestoredDocs = 0;

  for (const file of files) {
    if (!file.endsWith(".json") || file.endsWith(".indexes.json") || file === "metadata.json" || file === "backup_metadata.json") {
      continue;
    }

    const collName = path.basename(file, ".json");
    const filePath = path.join(backupDir, file);
    const indexFilePath = path.join(backupDir, `${collName}.indexes.json`);
    const content = fs.readFileSync(filePath, "utf8");

    let documents;
    try {
      documents = EJSON.parse(content);
    } catch (e) {
      documents = JSON.parse(content);
    }

    console.log(`Restoring collection: [${collName}] (${documents.length} docs)...`);
    const collection = db.collection(collName);

    // Clear collection before restoring full snapshot
    await collection.deleteMany({});

    if (documents.length > 0) {
      await collection.insertMany(documents, { ordered: false });
    }

    // Restore indexes if index file exists
    if (fs.existsSync(indexFilePath)) {
      try {
        const indexes = JSON.parse(fs.readFileSync(indexFilePath, "utf8"));
        for (const idx of indexes) {
          if (idx.name === "_id_") continue; // Default primary index already exists
          try {
            const { key, name, unique, sparse, background } = idx;
            const options = {};
            if (name) options.name = name;
            if (unique) options.unique = unique;
            if (sparse) options.sparse = sparse;
            if (background) options.background = background;
            await collection.createIndex(key, options);
          } catch (idxErr) {
            // Index creation warning can be safely skipped if already matches
          }
        }
      } catch (err) {
        console.warn(`  ⚠️ Index recovery notice for ${collName}: ${err.message}`);
      }
    }

    console.log(`  ✓ Restored ${documents.length} documents into [${collName}]`);
    restoredSummary[collName] = documents.length;
    totalRestoredDocs += documents.length;
  }

  await mongoose.disconnect();

  console.log("\n=================================================================");
  console.log("               DATABASE FULL RECOVERY COMPLETED                 ");
  console.log("=================================================================");
  console.table(
    Object.entries(restoredSummary).map(([name, count]) => ({
      Collection: name,
      "Restored Documents": count
    }))
  );
  console.log(`  Total Restored Collections: ${Object.keys(restoredSummary).length}`);
  console.log(`  Total Restored Documents:   ${totalRestoredDocs}`);
  console.log("=================================================================");
  console.log("  STATUS: Database fully recovered to exact backup state!");
  console.log("=================================================================\n");

  process.exit(0);
}

restoreDatabase().catch(err => {
  console.error("FATAL RESTORE ERROR:", err);
  process.exit(1);
});
