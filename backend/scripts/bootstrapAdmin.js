import "dotenv/config";
import crypto from "crypto";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { User } from "../models/user.model.js";
import { BootstrapToken } from "../models/bootstrapToken.model.js";
import { SecurityAuditLog } from "../models/securityAuditLog.model.js";

async function runBootstrap() {
  console.log("\n================================================================");
  console.log("       SARTHI V1 SUPER ADMIN INITIAL BOOTSTRAP INITIATION       ");
  console.log("================================================================\n");

  try {
    await connectDB(3, 2000);
    console.log("[Bootstrap] Database connection verified.");

    // Ensure partial unique index is synced in MongoDB
    try {
      await User.collection.dropIndex("role_1");
    } catch {}
    await User.syncIndexes();

    // 1. Check if any Super Admin already exists in the system
    const existingSuperAdminCount = await User.countDocuments({ role: "SUPER_ADMIN" });
    if (existingSuperAdminCount > 0) {
      console.error("\n[ABORTED] A Super Admin already exists in this Sarthi installation.");
      console.error("[ABORTED] Sarthi V1 enforces MAXIMUM SUPER ADMINS = 1.");
      console.error("[INFO] If your Super Admin Google account was lost or inaccessible,");
      console.error("[INFO] you must use the authorized Super Admin Recovery mechanism.\n");
      await mongoose.disconnect();
      process.exit(1);
    }

    // 2. Invalidate any previous unconsumed bootstrap tokens
    await BootstrapToken.deleteMany({ consumed: false });

    // 3. Generate high-entropy 256-bit cryptographically secure token
    const rawBootstrapToken = crypto.randomBytes(32).toString("hex");

    // 4. Hash the token with SHA-256 (Never store plaintext token in DB)
    const hashedToken = crypto.createHash("sha256").update(rawBootstrapToken).digest("hex");

    // 5. Save with 15-minute TTL
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await BootstrapToken.create({
      hashedToken,
      consumed: false,
      expiresAt,
      createdBy: "CLI_OPERATOR",
    });

    // 6. Record security audit event
    await SecurityAuditLog.create({
      event: "BOOTSTRAP_INITIATED",
      details: { expiresAt },
    });

    console.log("SUCCESS: Single-use Super Admin bootstrap authorization generated.");
    console.log("\n----------------------------------------------------------------");
    console.log("BOOTSTRAP AUTHORIZATION DETAILS (OPERATOR ONLY):");
    console.log(`Token:      ${rawBootstrapToken}`);
    console.log(`Expires:    15 minutes (${expiresAt.toISOString()})`);
    console.log(`Action URL: http://localhost:3000/bootstrap-admin?token=${rawBootstrapToken}`);
    console.log("----------------------------------------------------------------\n");
    console.log("INSTRUCTIONS:");
    console.log("1. Open the Action URL in your browser.");
    console.log("2. Sign in with your intended Super Admin Google account.");
    console.log("3. The backend will cryptographically verify Google's signed ID token,");
    console.log("   anchor your account as the ONLY Super Admin, and permanently consume this token.");
    console.log("4. Once provisioned, no additional Super Admin can ever be created.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("[Bootstrap Error] Initiation failed:", error.message);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

runBootstrap();
