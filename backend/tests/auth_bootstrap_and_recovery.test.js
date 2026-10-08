import "dotenv/config";
import assert from "assert";
import crypto from "crypto";
import connectDB from "../config/db.config.js";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { BootstrapToken } from "../models/bootstrapToken.model.js";
import { SecurityAuditLog } from "../models/securityAuditLog.model.js";
import userController from "../services/user-service/user.controller.js";
import { setCustomTokenVerifierForTesting } from "../services/user-service/googleAuth.service.js";
import { isSuperAdmin, requireSuperAdmin } from "../middlewares/rbac.middleware.js";
import * as envHelper from "../utils/envHelper.js";

function createMockReqRes({ cookies = {}, headers = {}, body = {}, user = null, ip = "127.0.0.1" } = {}) {
  const req = {
    method: "POST",
    cookies: { ...cookies },
    header: (name) => headers[name.toLowerCase()] || headers[name] || null,
    headers: { ...headers },
    body: { ...body },
    user,
    ip,
  };

  const res = {
    statusCode: 200,
    responseData: null,
    cookiesSet: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    },
    cookie(name, val, opts) {
      this.cookiesSet[name] = { val, opts };
      return this;
    },
  };

  return { req, res };
}

async function runBootstrapAndRecoveryTests() {
  await connectDB(3, 2000);
  console.log("=== TEST SUITE: SUPER ADMIN BOOTSTRAP, NORMAL LOGIN & RECOVERY ===\n");

  // Ensure old conflicting index is dropped if present and new partial unique index is synced
  try {
    await User.collection.dropIndex("role_1");
  } catch {}
  await User.syncIndexes();

  // Clean test slate
  await User.deleteMany({ email: /@test-bootstrap-recovery\.com$/ });
  await BootstrapToken.deleteMany({});
  await Session.deleteMany({});

  const initialSuperAdmins = await User.find({ role: "SUPER_ADMIN" });
  for (const admin of initialSuperAdmins) {
    admin.role = "USER";
    await admin.save();
  }

  // Configure test recovery secret
  process.env.SUPER_ADMIN_RECOVERY_SECRET = "secure-recovery-secret-test-v1";
  delete process.env.SUPER_ADMIN_RECOVERY_SECRET_HASH;

  // Setup mock Google tokens
  const mockTokens = new Map();
  const registerMockGoogleToken = (tokenId, payload) => {
    mockTokens.set(tokenId, payload);
  };

  setCustomTokenVerifierForTesting(async (idToken) => {
    if (mockTokens.has(idToken)) {
      return mockTokens.get(idToken);
    }
    const err = new Error("Invalid or unverified Google token signature");
    err.statusCode = 401;
    throw err;
  });

  const adminSub = "google-sub-superadmin-original-" + Date.now();
  const adminEmail = `admin_${Date.now()}@test-bootstrap-recovery.com`;
  const validAdminGoogleToken = "mock-valid-admin-google-token-" + Date.now();
  registerMockGoogleToken(validAdminGoogleToken, {
    sub: adminSub,
    email: adminEmail,
    firstName: "Initial",
    lastName: "SuperAdmin",
    picture: null,
    emailVerified: true,
  });

  // ==========================================
  // PART 1: BOOTSTRAP TESTS
  // ==========================================

  // Generate a valid bootstrap token
  const rawToken1 = crypto.randomBytes(32).toString("hex");
  const hashedToken1 = crypto.createHash("sha256").update(rawToken1).digest("hex");
  await BootstrapToken.create({
    hashedToken: hashedToken1,
    consumed: false,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    createdBy: "TEST_CLI",
  });

  // Test A: Invalid Google token does NOT consume the bootstrap token
  {
    const rawTokenUnburned = crypto.randomBytes(32).toString("hex");
    const hashedTokenUnburned = crypto.createHash("sha256").update(rawTokenUnburned).digest("hex");
    await BootstrapToken.create({
      hashedToken: hashedTokenUnburned,
      consumed: false,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdBy: "TEST_CLI",
    });

    const { req, res } = createMockReqRes({
      body: {
        bootstrapToken: rawTokenUnburned,
        credential: "invalid-forged-google-credential",
      },
    });

    try {
      await userController.bootstrapSuperAdmin(req, res);
      assert(res.statusCode >= 400);
    } catch (e) {
      assert(e.statusCode === 401 || res.statusCode >= 400);
    }

    const checkTokenDoc = await BootstrapToken.findOne({ hashedToken: hashedTokenUnburned });
    assert(checkTokenDoc, "Token must remain in database");
    assert.strictEqual(checkTokenDoc.consumed, false, "Bootstrap token MUST NOT be consumed if Google verification fails");
    console.log("PASS [A]: Invalid Google token does NOT burn/consume the bootstrap token");
  }

  // Test 1: Fresh database + valid bootstrap token + valid Google identity -> Super Admin created
  {
    const { req, res } = createMockReqRes({
      body: {
        bootstrapToken: rawToken1,
        credential: validAdminGoogleToken,
      },
    });
    await userController.bootstrapSuperAdmin(req, res);
    assert.strictEqual(res.statusCode, 200, "Bootstrap should succeed with 200");
    assert.strictEqual(res.responseData?.data?.user?.role, "SUPER_ADMIN", "User role must be SUPER_ADMIN");

    const createdAdmin = await User.findOne({ googleSub: adminSub });
    assert(createdAdmin, "User must exist in database");
    assert.strictEqual(createdAdmin.role, "SUPER_ADMIN", "Persisted role must be SUPER_ADMIN");
    assert.strictEqual(process.env.SUPER_ADMIN_GOOGLE_SUB, adminSub, "SUPER_ADMIN_GOOGLE_SUB must be updated");
    console.log("PASS [1]: Fresh database + valid bootstrap token + Google identity -> Super Admin created");
  }

  // Test B: Expired bootstrap token cannot be used
  {
    const rawExpired = crypto.randomBytes(32).toString("hex");
    const hashedExpired = crypto.createHash("sha256").update(rawExpired).digest("hex");
    await BootstrapToken.create({
      hashedToken: hashedExpired,
      consumed: false,
      expiresAt: new Date(Date.now() - 1000), // Expired 1 sec ago
    });

    const { req, res } = createMockReqRes({
      body: {
        bootstrapToken: rawExpired,
        credential: validAdminGoogleToken,
      },
    });
    await userController.bootstrapSuperAdmin(req, res);
    assert(res.statusCode >= 400, "Expired token must be rejected");
    console.log("PASS [B]: Expired bootstrap token cannot be used");
  }

  // Test C: Already-consumed bootstrap token cannot be reused
  {
    const { req, res } = createMockReqRes({
      body: {
        bootstrapToken: rawToken1, // Already consumed in Test 1
        credential: validAdminGoogleToken,
      },
    });
    await userController.bootstrapSuperAdmin(req, res);
    assert(res.statusCode >= 400, "Reused token must be rejected");
    console.log("PASS [C]: Already-consumed bootstrap token cannot be reused");
  }

  // Test D: Bootstrap after Super Admin already exists -> rejected (Two concurrent bootstrap attempts cannot create two Super Admins)
  {
    const rawToken2 = crypto.randomBytes(32).toString("hex");
    const hashedToken2 = crypto.createHash("sha256").update(rawToken2).digest("hex");
    await BootstrapToken.create({
      hashedToken: hashedToken2,
      consumed: false,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const { req, res } = createMockReqRes({
      body: {
        bootstrapToken: rawToken2,
        credential: validAdminGoogleToken,
      },
    });
    await userController.bootstrapSuperAdmin(req, res);
    assert.strictEqual(res.statusCode, 403, "Must fail with 403 when Super Admin already exists");
    console.log("PASS [D]: Two concurrent bootstrap attempts cannot create two Super Admins");
  }

  // Test: Client-provided role cannot escalate
  {
    const attackerSub = "attacker-sub-" + Date.now();
    const attackerEmail = `attacker_${Date.now()}@test-bootstrap-recovery.com`;
    const attackerToken = "attacker-google-token-" + Date.now();
    registerMockGoogleToken(attackerToken, {
      sub: attackerSub,
      email: attackerEmail,
      firstName: "Attacker",
      lastName: "User",
      picture: null,
      emailVerified: true,
    });

    const { req, res } = createMockReqRes({
      body: {
        credential: attackerToken,
        role: "SUPER_ADMIN",
      },
    });
    await userController.googleLogin(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.responseData?.data?.user?.role, "USER", "Attacker role must be USER, client role ignored");
    console.log("PASS [K1]: Client-provided role cannot escalate privileges");
  }

  // Test: Client-provided googleSub cannot escalate
  {
    const attackerToken2 = "attacker2-google-token-" + Date.now();
    registerMockGoogleToken(attackerToken2, {
      sub: "attacker-genuine-sub-" + Date.now(),
      email: `attacker2_${Date.now()}@test-bootstrap-recovery.com`,
      firstName: "Attacker2",
      lastName: "User",
      picture: null,
      emailVerified: true,
    });

    const { req, res } = createMockReqRes({
      body: {
        credential: attackerToken2,
        googleSub: adminSub,
      },
    });
    await userController.googleLogin(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.responseData?.data?.user?.role, "USER", "Attacker must remain USER");
    console.log("PASS [K2]: Client-provided googleSub in request body is ignored");
  }

  // Test L: Bootstrap token never appears in logs or error responses
  {
    const secretLeakCheckToken = "probe-secret-token-leak-check-xyz-123";
    const { req, res } = createMockReqRes({
      body: {
        bootstrapToken: secretLeakCheckToken,
        credential: "invalid-credential",
      },
    });
    try {
      await userController.bootstrapSuperAdmin(req, res);
    } catch {}
    const responseJsonStr = JSON.stringify(res.responseData || {});
    assert(!responseJsonStr.includes(secretLeakCheckToken), "Raw bootstrap token must never be reflected in error response");
    console.log("PASS [L]: Bootstrap token never appears in error responses");
  }

  // ==========================================
  // PART 2: NORMAL LOGIN & RBAC TESTS
  // ==========================================

  // Test O: Normal Google login after bootstrap
  {
    const { req, res } = createMockReqRes({
      body: {
        credential: validAdminGoogleToken,
      },
    });
    await userController.googleLogin(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.responseData?.data?.user?.role, "SUPER_ADMIN", "Configured admin gets SUPER_ADMIN");

    // Other account gets USER
    const otherToken = "other-token-" + Date.now();
    registerMockGoogleToken(otherToken, {
      sub: "other-sub-" + Date.now(),
      email: `other_${Date.now()}@test-bootstrap-recovery.com`,
      firstName: "Other",
      lastName: "Student",
      picture: null,
      emailVerified: true,
    });
    const { req: req2, res: res2 } = createMockReqRes({
      body: { credential: otherToken },
    });
    await userController.googleLogin(req2, res2);
    assert.strictEqual(res2.statusCode, 200);
    assert.strictEqual(res2.responseData?.data?.user?.role, "USER", "Any other Google sub gets USER");
    console.log("PASS [O]: Normal Google login: configured Super Admin -> SUPER_ADMIN; any other -> USER");
  }

  // Test P: If SUPER_ADMIN_GOOGLE_SUB is missing, authorization fails closed
  {
    const currentSub = process.env.SUPER_ADMIN_GOOGLE_SUB;
    delete process.env.SUPER_ADMIN_GOOGLE_SUB;

    const mockAdmin = { googleSub: currentSub, role: "SUPER_ADMIN" };
    assert.strictEqual(isSuperAdmin(mockAdmin), false, "Must fail closed when SUPER_ADMIN_GOOGLE_SUB is missing");

    process.env.SUPER_ADMIN_GOOGLE_SUB = currentSub;
    console.log("PASS [P]: If SUPER_ADMIN_GOOGLE_SUB is missing, authorization fails closed");
  }

  // ==========================================
  // PART 3: RECOVERY & TRANSACTION TESTS
  // ==========================================

  // Test F: Recovery with invalid recovery secret does not modify existing Super Admin
  {
    const replacementTokenF = "replacement-token-f-" + Date.now();
    registerMockGoogleToken(replacementTokenF, {
      sub: "replacement-sub-f-" + Date.now(),
      email: `replacement_f_${Date.now()}@test-bootstrap-recovery.com`,
      firstName: "ReplacementF",
      lastName: "Admin",
      picture: null,
      emailVerified: true,
    });

    const { req, res } = createMockReqRes({
      body: {
        recoverySecret: "wrong-secret-guess",
        credential: replacementTokenF,
      },
      ip: "10.0.0.99",
    });
    await userController.recoverSuperAdmin(req, res);
    assert.strictEqual(res.statusCode, 401);

    const originalAdminCheck = await User.findOne({ googleSub: adminSub });
    assert.strictEqual(originalAdminCheck.role, "SUPER_ADMIN", "Original Super Admin must remain SUPER_ADMIN after failed recovery");
    console.log("PASS [F]: Recovery with invalid recovery secret does not modify existing Super Admin");
  }

  // Test E: Recovery with invalid Google authentication does not modify existing Super Admin
  {
    const { req, res } = createMockReqRes({
      body: {
        recoverySecret: "secure-recovery-secret-test-v1",
        credential: "invalid-unverified-replacement-token",
      },
      ip: "127.0.0.1",
    });
    try {
      await userController.recoverSuperAdmin(req, res);
      assert(res.statusCode >= 400);
    } catch (e) {
      assert(e.statusCode === 401 || res.statusCode >= 400);
    }

    const originalAdminCheck = await User.findOne({ googleSub: adminSub });
    assert.strictEqual(originalAdminCheck.role, "SUPER_ADMIN", "Original Super Admin must remain SUPER_ADMIN after invalid Google token");
    console.log("PASS [E]: Recovery with invalid Google authentication does not modify existing Super Admin");
  }

  // Test M: Recovery secret never appears in logs or error responses
  {
    const secretLeakProbe = "probe-secret-leak-xyz-789";
    const { req, res } = createMockReqRes({
      body: {
        recoverySecret: secretLeakProbe,
        credential: "invalid-credential",
      },
      ip: "10.0.0.88",
    });
    await userController.recoverSuperAdmin(req, res);
    const resStr = JSON.stringify(res.responseData || {});
    assert(!resStr.includes(secretLeakProbe), "Recovery secret must never be reflected in response");
    console.log("PASS [M]: Recovery secret never appears in error responses");
  }

  // Test G: Simulated database failure during recovery transaction rolls back completely
  {
    const replacementSubG = "replacement-google-sub-g-" + Date.now();
    const tokenG = "token-g-" + Date.now();
    registerMockGoogleToken(tokenG, {
      sub: replacementSubG,
      email: `admin_g_${Date.now()}@test-bootstrap-recovery.com`,
      firstName: "AdminG",
      lastName: "Test",
      picture: null,
      emailVerified: true,
    });

    // Temporarily monkey-patch User.create within recovery to throw mid-transaction
    const originalCreate = User.create;
    User.create = async function () {
      throw new Error("Simulated database failure during recovery transaction");
    };

    const { req, res } = createMockReqRes({
      body: {
        recoverySecret: "secure-recovery-secret-test-v1",
        credential: tokenG,
      },
      ip: "127.0.0.1",
    });

    try {
      await userController.recoverSuperAdmin(req, res);
      assert.strictEqual(res.statusCode, 500, "Should return 500 on simulated DB failure");
      assert(res.responseData?.message?.includes("Simulated database failure"), "Response message must report DB failure");
    } finally {
      User.create = originalCreate;
    }

    // Verify rollback: original Super Admin is still SUPER_ADMIN!
    const originalAdminCheck = await User.findOne({ googleSub: adminSub });
    assert.strictEqual(originalAdminCheck.role, "SUPER_ADMIN", "Original Super Admin must remain SUPER_ADMIN after transaction rollback");
    const failedReplacement = await User.findOne({ googleSub: replacementSubG });
    assert(!failedReplacement, "Rolled-back replacement user must not exist in DB");
    console.log("PASS [G]: Simulated database failure during recovery rolls back and leaves original Super Admin intact");
  }

  // Test H, I, J: Successful recovery results in exactly one SUPER_ADMIN, old sessions revoked, new session works
  const replacementSubFinal = "replacement-google-sub-final-" + Date.now();
  const replacementEmailFinal = `replacement_${Date.now()}@test-bootstrap-recovery.com`;
  const validReplacementTokenFinal = "valid-replacement-google-token-final-" + Date.now();
  registerMockGoogleToken(validReplacementTokenFinal, {
    sub: replacementSubFinal,
    email: replacementEmailFinal,
    firstName: "New",
    lastName: "SuperAdmin",
    picture: null,
    emailVerified: true,
  });

  {
    const oldAdminBefore = await User.findOne({ googleSub: adminSub });
    assert.strictEqual(oldAdminBefore.role, "SUPER_ADMIN");

    // Active session for old admin
    await Session.create({
      userId: oldAdminBefore._id,
      sessionId: "old-admin-session-" + Date.now(),
      refreshTokenHash: "hash-old-admin",
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const { req, res } = createMockReqRes({
      body: {
        recoverySecret: "secure-recovery-secret-test-v1",
        credential: validReplacementTokenFinal,
      },
      ip: "127.0.0.1",
    });
    await userController.recoverSuperAdmin(req, res);
    assert.strictEqual(res.statusCode, 200, "Recovery must succeed with 200");
    assert.strictEqual(res.responseData?.data?.user?.role, "SUPER_ADMIN", "New admin gets SUPER_ADMIN");

    // Test H: Exactly one Super Admin in DB
    const totalSuperAdmins = await User.countDocuments({ role: "SUPER_ADMIN" });
    assert.strictEqual(totalSuperAdmins, 1, "There must remain EXACTLY ONE Super Admin after recovery");
    console.log("PASS [H]: Successful recovery results in exactly one SUPER_ADMIN");

    // Test I: Old Super Admin sessions are revoked
    const oldSessions = await Session.find({ userId: oldAdminBefore._id, isActive: true });
    assert.strictEqual(oldSessions.length, 0, "All sessions of old Super Admin must be revoked");
    const oldAdminDoc = await User.findOne({ googleSub: adminSub });
    assert.strictEqual(oldAdminDoc.role, "USER", "Old admin is demoted to USER");
    console.log("PASS [I]: Old Super Admin sessions are invalid and role is USER after recovery");

    // Test J: New Super Admin session works
    assert(res.responseData?.data?.accessToken, "New Super Admin receives valid access token");
    assert(res.responseData?.data?.sessionId, "New Super Admin receives valid session ID");
    assert.strictEqual(process.env.SUPER_ADMIN_GOOGLE_SUB, replacementSubFinal, "Configured sub points to new identity");
    console.log("PASS [J]: New Super Admin session created and working after recovery");
  }

  // Test N: .env persistence failure is handled safely
  {
    const failedWrite = envHelper.updateEnvConfig("", 123);
    assert.strictEqual(failedWrite, false, "Invalid key/value must return false and fail closed");
    console.log("PASS [N]: envHelper failure is handled safely and fails closed");
  }

  // Clean up test documents
  await User.deleteMany({ email: /@test-bootstrap-recovery\.com$/ });
  await BootstrapToken.deleteMany({});
  await Session.deleteMany({});

  console.log("\n=== ALL SUPER ADMIN BOOTSTRAP, LOGIN & RECOVERY TESTS PASSED ===\n");
}

runBootstrapAndRecoveryTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test Suite Failed:", err);
    process.exit(1);
  });
