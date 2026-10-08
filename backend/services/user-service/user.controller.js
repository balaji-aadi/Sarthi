import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/user.model.js";
import { Session } from "../../models/session.model.js";
import { UserRole } from "../../models/role.model.js";
import { FCMDevice } from "../../models/fcmdevice.model.js";
import { verifyGoogleIdToken } from "./googleAuth.service.js";
import { isSuperAdmin } from "../../middlewares/rbac.middleware.js";
import { BootstrapToken } from "../../models/bootstrapToken.model.js";
import { SecurityAuditLog } from "../../models/securityAuditLog.model.js";
import { updateEnvConfig } from "../../utils/envHelper.js";
import crypto from "crypto";

const uc = {};

/**
 * Strips sensitive authentication fields from the user document before returning to client.
 */
export const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.otp;
  delete userObj.otpTime;
  return userObj;
};

/**
 * Creates an authoritative Sarthi session enforcing single active session per user.
 * 1. Invalidate any existing active sessions for this user.
 * 2. Increments user.sessionVersion.
 * 3. Creates a new Session record with SHA-256 hashed refresh token.
 * 4. Issues short-lived access token (~15m).
 * 5. Sets secure HttpOnly cookies.
 */
export const createSarthiSession = async ({ user, req, res }) => {
  // 1. Invalidate ALL previous active sessions for this user (Single Active Device / Session enforcement)
  await Session.updateMany(
    { userId: user._id, isActive: true },
    { $set: { isActive: false, revokedAt: new Date() } }
  );

  // 2. Increment sessionVersion on User model
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save({ validateBeforeSave: false });

  // 3. Generate unique sessionId and cryptographically random refresh token
  const sessionId = crypto.randomUUID();
  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const refreshTokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

  const refreshExpiryDays = 14;
  const expiresAt = new Date(Date.now() + refreshExpiryDays * 24 * 60 * 60 * 1000);

  const session = await Session.create({
    userId: user._id,
    sessionId,
    sessionVersion: user.sessionVersion,
    refreshTokenHash,
    isActive: true,
    userAgent: req?.headers ? req.headers["user-agent"] : null,
    ipAddress: req?.ip || req?.connection?.remoteAddress || null,
    expiresAt,
    lastUsedAt: new Date(),
  });

  // 4. Generate short-lived Access Token (15m)
  const accessToken = user.generateAccessToken({
    sessionId: session.sessionId,
    sessionVersion: user.sessionVersion,
  });

  // 5. Set secure httpOnly cookies
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  if (res && typeof res.cookie === "function") {
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", rawRefreshToken, {
      ...cookieOptions,
      maxAge: refreshExpiryDays * 24 * 60 * 60 * 1000, // 14 days
    });
  }

  return { accessToken, rawRefreshToken, session };
};

/**
 * Authoritative Google Login & Auto-Provisioning.
 * Strictly verifies the Google ID token and uses Google 'sub' as primary identity anchor.
 */
uc.googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  console.log("[GoogleLogin] request received");
  console.log("[GoogleLogin] credential present:", credential ? "YES" : "NO");

  if (!credential) {
    return res.status(400).json(new ApiError(400, "Google credential token is required"));
  }

  // Fast database check to prevent 45-second Mongoose buffering hangs when disconnected
  if (mongoose.connection.readyState !== 1) {
    console.error(`[GoogleLogin] Database not ready (readyState: ${mongoose.connection.readyState})`);
    return res.status(503).json(
      new ApiError(503, "Database is currently disconnected or reconnecting. Please check database connectivity.")
    );
  }

  // 1. Authoritative verification of Google ID token
  const t0 = Date.now();
  console.log("[GoogleLogin] token verification started");
  const googlePayload = await verifyGoogleIdToken(credential);
  console.log(`[GoogleLogin] token verification completed: ${Date.now() - t0} ms`);
  console.log("[GoogleLogin] verified Google sub present:", googlePayload?.sub ? "YES" : "NO");
  const { sub, email, firstName, lastName, picture } = googlePayload;

  // 2. Lookup strictly by googleSub (sole external identity key)
  const t1 = Date.now();
  console.log("[GoogleLogin] user lookup started");
  let user = await User.findOne({ googleSub: sub });
  console.log(`[GoogleLogin] user lookup completed: ${Date.now() - t1} ms`);

  // 3. Super Admin determination: strictly anchored to configured verified Google sub (fail closed)
  const configuredAdminSub = process.env.SUPER_ADMIN_GOOGLE_SUB;
  const isConfiguredSuperAdmin = Boolean(
    configuredAdminSub && sub && sub === configuredAdminSub
  );

  if (!user) {
    // Prevent silent linking: if an account with this email exists, reject automatic takeover
    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      return res.status(409).json(
        new ApiError(
          409,
          "An account with this email already exists without a linked Google identity. Automatic linking by email is disabled."
        )
      );
    }

    // 4. Create new user (Role is USER unless configured Super Admin)
    let defaultRole = await UserRole.findOne({ name: "user" });
    if (!defaultRole) {
      defaultRole = await UserRole.findOne({ name: "employee" });
    }

    user = await User.create({
      googleSub: sub,
      email,
      firstName: firstName || "User",
      lastName: lastName || "",
      profileImage: picture || null,
      role: isConfiguredSuperAdmin ? "SUPER_ADMIN" : "USER",
      isActive: true,
      userRole: defaultRole ? defaultRole._id : undefined,
      userRoles: defaultRole ? [defaultRole._id] : [],
    });
  } else {
    // Existing user: ensure only the configured Super Admin can have SUPER_ADMIN role
    if (!isConfiguredSuperAdmin && user.role === "SUPER_ADMIN") {
      user.role = "USER";
    } else if (isConfiguredSuperAdmin && user.role !== "SUPER_ADMIN") {
      user.role = "SUPER_ADMIN";
    }
    if (!user.profileImage && picture) {
      user.profileImage = picture;
    }
    await user.save({ validateBeforeSave: false });
  }

  // 5. Blocked-user enforcement:
  if (user.isActive === false) {
    return res.status(403).json(
      new ApiError(403, "Your account has been deactivated or blocked. Please contact support.")
    );
  }

  // 6. Create active Sarthi session (single active device enforcement)
  const t2 = Date.now();
  console.log("[GoogleLogin] session creation started");
  const { accessToken, session } = await createSarthiSession({ user, req, res });
  console.log(`[GoogleLogin] session creation completed: ${Date.now() - t2} ms`);
  console.log("[GoogleLogin] login completed successfully");

  const sanitizedUser = sanitizeUser(user);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: sanitizedUser,
        accessToken,
        sessionId: session.sessionId,
      },
      "Logged in via Google successfully"
    )
  );
});

// Rate limiting and lockout tracker for Super Admin recovery
const recoveryAttempts = new Map();
const MAX_RECOVERY_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 mins

const checkRecoveryRateLimit = (ip) => {
  const now = Date.now();
  const record = recoveryAttempts.get(ip);
  if (record) {
    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, remainingSeconds };
    }
    if (record.lockedUntil && record.lockedUntil <= now) {
      recoveryAttempts.delete(ip);
    }
  }
  return { allowed: true };
};

const recordFailedRecovery = (ip) => {
  const now = Date.now();
  const record = recoveryAttempts.get(ip) || { count: 0, firstAttempt: now };
  record.count += 1;
  if (record.count >= MAX_RECOVERY_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  recoveryAttempts.set(ip, record);
};

const resetRecoveryRateLimit = (ip) => {
  recoveryAttempts.delete(ip);
};

const verifyRecoverySecret = (providedSecret) => {
  if (!providedSecret || typeof providedSecret !== "string") return false;

  const configuredHash = process.env.SUPER_ADMIN_RECOVERY_SECRET_HASH;
  const configuredPlain = process.env.SUPER_ADMIN_RECOVERY_SECRET;

  if (!configuredHash && !configuredPlain) return false;

  const providedHash = crypto.createHash("sha256").update(providedSecret.trim()).digest();

  if (configuredHash) {
    const rawExpectedHex = configuredHash.replace(/^sha256:/i, "").trim();
    const expectedBuf = Buffer.from(rawExpectedHex, "hex");
    if (expectedBuf.length !== providedHash.length) return false;
    return crypto.timingSafeEqual(providedHash, expectedBuf);
  } else if (configuredPlain) {
    const expectedHash = crypto.createHash("sha256").update(configuredPlain.trim()).digest();
    return crypto.timingSafeEqual(providedHash, expectedHash);
  }

  return false;
};

/**
 * Super Admin One-Time Bootstrap
 * Atomically creates the first and ONLY Super Admin.
 * Safe Ordering:
 * 1. Validate inputs & DB readiness
 * 2. Cryptographically verify Google ID token FIRST (never burn token on invalid Google credential)
 * 3. Extract verified sub
 * 4. In MongoDB transaction:
 *    - Verify 0 Super Admins currently exist
 *    - Atomically verify and consume the bootstrap token
 *    - Create/promote user as SUPER_ADMIN
 *    - Verify exactly 1 Super Admin invariant
 *    - Commit transaction
 * 5. Persist SUPER_ADMIN_GOOGLE_SUB to server configuration
 * 6. Issue session and HttpOnly cookies
 */
uc.bootstrapSuperAdmin = asyncHandler(async (req, res) => {
  const { bootstrapToken, credential } = req.body;

  if (!bootstrapToken || typeof bootstrapToken !== "string") {
    return res.status(400).json(new ApiError(400, "Bootstrap authorization token is required"));
  }
  if (!credential || typeof credential !== "string") {
    return res.status(400).json(new ApiError(400, "Google credential is required"));
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json(new ApiError(503, "Database is currently unavailable"));
  }

  // 1. Initial precondition check: Exactly zero Super Admins currently exist
  const existingSuperAdminCount = await User.countDocuments({ role: "SUPER_ADMIN" });
  if (existingSuperAdminCount > 0) {
    await SecurityAuditLog.create({
      event: "BOOTSTRAP_FAILED",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: { reason: "Super Admin already provisioned" },
    });
    return res.status(403).json(
      new ApiError(403, "Super Admin has already been provisioned. Multiple Super Admins are strictly forbidden.")
    );
  }

  // 2. Cryptographically verify Google ID token FIRST (Token is NOT consumed if this fails)
  const googlePayload = await verifyGoogleIdToken(credential);
  const { sub, email, firstName, lastName, picture } = googlePayload;

  // 3. Hash the provided bootstrap token
  const hashedToken = crypto.createHash("sha256").update(bootstrapToken.trim()).digest("hex");

  // 4. Atomic State Transition using MongoDB Transaction
  const dbSession = await mongoose.startSession();
  let bootstrapCommitted = false;
  let user = null;

  try {
    dbSession.startTransaction();

    // Re-verify no Super Admin was created concurrently within the transaction
    const adminCountInTx = await User.countDocuments({ role: "SUPER_ADMIN" }).session(dbSession);
    if (adminCountInTx > 0) {
      await dbSession.abortTransaction();
      await SecurityAuditLog.create({
        event: "BOOTSTRAP_FAILED",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: { reason: "Concurrent Super Admin creation detected" },
      });
      return res.status(403).json(
        new ApiError(403, "Super Admin has already been provisioned concurrently.")
      );
    }

    // Atomically find & consume the bootstrap token within the transaction
    const tokenDoc = await BootstrapToken.findOneAndUpdate(
      {
        hashedToken,
        consumed: false,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          consumed: true,
          consumedAt: new Date(),
          ipAddress: req.ip,
        },
      },
      { new: false, session: dbSession }
    );

    if (!tokenDoc) {
      await dbSession.abortTransaction();
      await SecurityAuditLog.create({
        event: "BOOTSTRAP_FAILED",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: { reason: "Invalid, expired, or consumed bootstrap token" },
      });
      return res.status(400).json(
        new ApiError(400, "Invalid, expired, or already-consumed bootstrap token")
      );
    }

    // Find or create user with role SUPER_ADMIN within the transaction
    user = await User.findOne({ googleSub: sub }).session(dbSession);
    if (!user) {
      const createdUsers = await User.create(
        [
          {
            googleSub: sub,
            email,
            firstName: firstName || "Super",
            lastName: lastName || "Admin",
            profileImage: picture || null,
            role: "SUPER_ADMIN",
            isActive: true,
          },
        ],
        { session: dbSession }
      );
      user = createdUsers[0];
    } else {
      user.role = "SUPER_ADMIN";
      user.isActive = true;
      await user.save({ session: dbSession });
    }

    // Verify invariant: exactly 1 Super Admin in database
    const totalAdmins = await User.countDocuments({ role: "SUPER_ADMIN" }).session(dbSession);
    if (totalAdmins !== 1) {
      throw new Error(`Bootstrap invariant violated: expected 1 Super Admin, got ${totalAdmins}`);
    }

    await dbSession.commitTransaction();
    bootstrapCommitted = true;
  } catch (txErr) {
    if (dbSession.inTransaction()) {
      await dbSession.abortTransaction();
    }
    throw txErr;
  } finally {
    await dbSession.endSession();
  }

  if (!bootstrapCommitted) {
    return res.status(500).json(new ApiError(500, "Bootstrap transaction failed to commit"));
  }

  // 5. Persist to server configuration
  const envPersisted = updateEnvConfig("SUPER_ADMIN_GOOGLE_SUB", sub);
  if (!envPersisted) {
    throw new ApiError(500, "Failed to persist Super Admin identity to server configuration");
  }

  // 6. Security audit event
  await SecurityAuditLog.create({
    event: "BOOTSTRAP_SUCCESS",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    details: { userId: user._id },
  });

  // 7. Create session & cookies
  const { accessToken, session } = await createSarthiSession({ user, req, res });
  const sanitizedUser = sanitizeUser(user);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: sanitizedUser,
        accessToken,
        sessionId: session.sessionId,
      },
      "Super Admin successfully provisioned and authenticated"
    )
  );
});

/**
 * Super Admin Recovery Step 1: Challenge
 * Verifies recovery secret under strong rate limiting and issues short-lived single-use ticket.
 */
uc.recoveryChallenge = asyncHandler(async (req, res) => {
  const { recoverySecret } = req.body;

  const rateCheck = checkRecoveryRateLimit(req.ip);
  if (!rateCheck.allowed) {
    return res.status(429).json(
      new ApiError(429, `Too many failed recovery attempts. Locked out for ${rateCheck.remainingSeconds}s.`)
    );
  }

  if (!recoverySecret || !verifyRecoverySecret(recoverySecret)) {
    recordFailedRecovery(req.ip);
    await SecurityAuditLog.create({
      event: "RECOVERY_FAILED",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: { reason: "Invalid recovery secret in challenge" },
    });
    return res.status(401).json(new ApiError(401, "Invalid recovery secret"));
  }

  // Generate 5-minute single-use ticket
  const rawTicket = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawTicket).digest("hex");
  await BootstrapToken.create({
    hashedToken,
    consumed: false,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min TTL
    createdBy: "RECOVERY_CHALLENGE",
    ipAddress: req.ip,
  });

  await SecurityAuditLog.create({
    event: "RECOVERY_ATTEMPT",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { recoverySessionToken: rawTicket },
      "Recovery secret verified. Please authenticate with your replacement Google account."
    )
  );
});

/**
 * Super Admin Recovery / Replacement
 * Authorizes replacing the existing Super Admin Google identity with a new verified Google account.
 * Maintains MAXIMUM SUPER ADMINS = 1 invariant by revoking old Super Admin sessions and role.
 * Executes within a database transaction to guarantee all-or-nothing rollback consistency.
 */
uc.recoverSuperAdmin = asyncHandler(async (req, res) => {
  const { recoverySecret, recoverySessionToken, credential } = req.body;

  if (!credential || typeof credential !== "string") {
    return res.status(400).json(new ApiError(400, "Replacement Google credential is required"));
  }

  // 1. Rate limiting
  const rateCheck = checkRecoveryRateLimit(req.ip);
  if (!rateCheck.allowed) {
    return res.status(429).json(
      new ApiError(429, `Too many failed recovery attempts. Locked out for ${rateCheck.remainingSeconds}s.`)
    );
  }

  // 2. Constant-time verification of recovery authorization
  let authorized = false;

  if (recoverySessionToken && typeof recoverySessionToken === "string") {
    const hashedTicket = crypto.createHash("sha256").update(recoverySessionToken.trim()).digest("hex");
    const ticketDoc = await BootstrapToken.findOneAndUpdate(
      {
        hashedToken: hashedTicket,
        consumed: false,
        createdBy: "RECOVERY_CHALLENGE",
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          consumed: true,
          consumedAt: new Date(),
          ipAddress: req.ip,
        },
      },
      { new: false }
    );
    if (ticketDoc) authorized = true;
  } else if (recoverySecret && typeof recoverySecret === "string") {
    authorized = verifyRecoverySecret(recoverySecret);
  }

  if (!authorized) {
    recordFailedRecovery(req.ip);
    await SecurityAuditLog.create({
      event: "RECOVERY_FAILED",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: { reason: "Invalid recovery credentials or expired recovery ticket" },
    });
    return res.status(401).json(new ApiError(401, "Invalid recovery credentials or expired recovery ticket"));
  }

  // 3. Cryptographically verify replacement Google identity FIRST before any database mutations
  const googlePayload = await verifyGoogleIdToken(credential);
  const { sub, email, firstName, lastName, picture } = googlePayload;

  // 4. Atomic Transaction for Identity Replacement
  const dbSession = await mongoose.startSession();
  let recoveryCommitted = false;
  let replacementUser = null;
  let oldAdminId = null;

  try {
    dbSession.startTransaction();

    // Verify and demote current Super Admin
    const oldSuperAdmin = await User.findOne({ role: "SUPER_ADMIN" }).session(dbSession);
    if (oldSuperAdmin) {
      oldAdminId = oldSuperAdmin._id;
      oldSuperAdmin.role = "USER";
      oldSuperAdmin.sessionVersion = (oldSuperAdmin.sessionVersion || 1) + 1;
      await oldSuperAdmin.save({ session: dbSession });

      // Revoke all active sessions for old Super Admin
      await Session.updateMany(
        { userId: oldSuperAdmin._id, isActive: true },
        { $set: { isActive: false, revokedAt: new Date() } },
        { session: dbSession }
      );
    }

    // Promote or create replacement Super Admin
    replacementUser = await User.findOne({ googleSub: sub }).session(dbSession);
    if (!replacementUser) {
      const createdUsers = await User.create(
        [
          {
            googleSub: sub,
            email,
            firstName: firstName || "Super",
            lastName: lastName || "Admin",
            profileImage: picture || null,
            role: "SUPER_ADMIN",
            isActive: true,
          },
        ],
        { session: dbSession }
      );
      replacementUser = createdUsers[0];
    } else {
      replacementUser.role = "SUPER_ADMIN";
      replacementUser.isActive = true;
      await replacementUser.save({ session: dbSession });
    }

    // Strict invariant: exactly one Super Admin must exist
    const totalSuperAdmins = await User.countDocuments({ role: "SUPER_ADMIN" }).session(dbSession);
    if (totalSuperAdmins !== 1) {
      throw new Error(`Recovery invariant failed: expected exactly 1 Super Admin, got ${totalSuperAdmins}`);
    }

    await dbSession.commitTransaction();
    recoveryCommitted = true;
  } catch (txErr) {
    if (dbSession.inTransaction()) {
      await dbSession.abortTransaction();
    }
    throw txErr;
  } finally {
    await dbSession.endSession();
  }

  if (!recoveryCommitted) {
    return res.status(500).json(new ApiError(500, "Recovery transaction failed to commit"));
  }

  // 5. Update server configuration
  const envPersisted = updateEnvConfig("SUPER_ADMIN_GOOGLE_SUB", sub);
  if (!envPersisted) {
    throw new ApiError(500, "Failed to persist replacement Super Admin identity to server configuration");
  }

  // 6. Reset rate limit on success
  resetRecoveryRateLimit(req.ip);

  // 7. Security audit event
  await SecurityAuditLog.create({
    event: "RECOVERY_SUCCESS",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    details: { oldAdminId, newAdminId: replacementUser._id },
  });

  if (oldAdminId) {
    await SecurityAuditLog.create({
      event: "SUPER_ADMIN_DEMOTED",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: { oldUserId: oldAdminId },
    });
  }

  // 8. Establish session and issue HttpOnly cookies ONLY after successful commit
  const { accessToken, session } = await createSarthiSession({ user: replacementUser, req, res });
  const sanitizedUser = sanitizeUser(replacementUser);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: sanitizedUser,
        accessToken,
        sessionId: session.sessionId,
      },
      "Super Admin successfully recovered and replaced"
    )
  );
});

/**
 * Secure Refresh Token endpoint with single active session check, token rotation, and reuse detection.
 */
uc.refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json(new ApiError(401, "Unauthorized: Refresh token missing"));
  }

  try {
    const incomingHash = crypto.createHash("sha256").update(incomingRefreshToken).digest("hex");

    let session = await Session.findOne({ refreshTokenHash: incomingHash });

    if (!session) {
      // Check if an already rotated token is being reused (Token Reuse Attack Detection)
      const reusedSession = await Session.findOne({ previousRefreshTokenHashes: incomingHash });
      if (reusedSession) {
        // Invalidate session immediately and bump user sessionVersion to revoke all active tokens
        reusedSession.isActive = false;
        reusedSession.revokedAt = new Date();
        await reusedSession.save();

        await User.findByIdAndUpdate(reusedSession.userId, {
          $inc: { sessionVersion: 1 },
        });

        return res.status(401).json(
          new ApiError(401, "Security alert: Refresh token reuse detected. Session revoked.")
        );
      }

      return res.status(401).json(new ApiError(401, "Invalid or unrecognized refresh token"));
    }

    if (!session.isActive || session.expiresAt < new Date()) {
      return res.status(401).json(new ApiError(401, "Session is expired or revoked"));
    }

    const user = await User.findById(session.userId);

    if (!user) {
      session.isActive = false;
      await session.save();
      return res.status(401).json(new ApiError(401, "User not found"));
    }

    if (user.isActive === false) {
      session.isActive = false;
      await session.save();
      return res.status(403).json(new ApiError(403, "Account has been deactivated or blocked"));
    }

    // Single active session version check:
    if (session.sessionVersion !== user.sessionVersion) {
      session.isActive = false;
      await session.save();
      return res.status(401).json(
        new ApiError(401, "Session superseded: You have logged in on another device")
      );
    }

    // Refresh Token Rotation: record previous token hash for reuse detection, issue a new random refresh token
    const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
    const newHash = crypto.createHash("sha256").update(newRawRefreshToken).digest("hex");

    session.previousRefreshTokenHashes = session.previousRefreshTokenHashes || [];
    session.previousRefreshTokenHashes.push(incomingHash);
    if (session.previousRefreshTokenHashes.length > 10) {
      session.previousRefreshTokenHashes.shift();
    }
    session.refreshTokenHash = newHash;
    session.lastUsedAt = new Date();
    await session.save();

    const accessToken = user.generateAccessToken({
      sessionId: session.sessionId,
      sessionVersion: user.sessionVersion,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    const refreshExpiryDays = 14;
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRawRefreshToken, {
      ...cookieOptions,
      maxAge: refreshExpiryDays * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          user: sanitizeUser(user),
          sessionId: session.sessionId,
        },
        "Access token refreshed successfully"
      )
    );
  } catch (error) {
    return res.status(401).json(new ApiError(401, error?.message || "Invalid refresh token"));
  }
});

/**
 * Authoritative Server-Side Logout.
 * Revokes the session in DB and clears authentication cookies.
 */
uc.logoutUser = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (req.session?.sessionId) {
      await Session.updateOne(
        { sessionId: req.session.sessionId },
        { $set: { isActive: false, revokedAt: new Date() } }
      );
    } else if (req.user?._id) {
      await Session.updateMany(
        { userId: req.user._id, isActive: true },
        { $set: { isActive: false, revokedAt: new Date() } }
      );
    } else if (incomingRefreshToken) {
      const hash = crypto.createHash("sha256").update(incomingRefreshToken).digest("hex");
      await Session.updateOne(
        { refreshTokenHash: hash },
        { $set: { isActive: false, revokedAt: new Date() } }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error during logout"));
  }
});

/**
 * Returns currently authenticated user profile.
 */
uc.getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json(new ApiError(401, "Not authenticated"));
  }
  return res.status(200).json(
    new ApiResponse(200, { user: sanitizeUser(req.user) }, "Current user fetched successfully")
  );
});

/**
 * Updates self account details (only non-sensitive profile fields).
 */
uc.updateAccountDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNumber, address, profileImage } = req.body;

  const existingUser = await User.findById(req.user?._id);
  if (!existingUser) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(firstName && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(profileImage !== undefined && { profileImage }),
      },
    },
    { new: true }
  ).select("-password -refreshToken -otp -otpTime");

  return res
    .status(200)
    .json(new ApiResponse(200, sanitizeUser(user), "Account details updated successfully"));
});

/**
 * Inactive / Deprecated legacy auth endpoints (blocked for security).
 */
uc.loginUser = asyncHandler(async (req, res) => {
  return res.status(400).json(
    new ApiError(400, "Password login is disabled. Please sign in with Google.")
  );
});

uc.registerUser = asyncHandler(async (req, res) => {
  return res.status(400).json(
    new ApiError(400, "Password registration is disabled. Please sign in with Google.")
  );
});

uc.zohoLogin = asyncHandler(async (req, res) => {
  return res.status(400).json(
    new ApiError(400, "Zoho authentication is disabled. Please sign in with Google.")
  );
});

uc.generateOTP = asyncHandler(async (req, res) => {
  return res.status(400).json(
    new ApiError(400, "Password reset is disabled. Please sign in with Google.")
  );
});

uc.verifyOTP = asyncHandler(async (req, res) => {
  return res.status(400).json(
    new ApiError(400, "Password reset is disabled. Please sign in with Google.")
  );
});

uc.resetPassword = asyncHandler(async (req, res) => {
  return res.status(400).json(
    new ApiError(400, "Password reset is disabled. Please sign in with Google.")
  );
});

uc.changeCurrentPassword = asyncHandler(async (req, res) => {
  return res.status(400).json(
    new ApiError(400, "Password management is disabled. Accounts are managed via Google.")
  );
});

/**
 * FCM Token registration securely anchored to authenticated user.
 */
uc.createFCMToken = asyncHandler(async (req, res) => {
  const { fcm_token, device_type, device_id } = req.body;
  const user_id = req.user?._id || req.body.user_id;

  if (!user_id || !fcm_token || !device_type) {
    return res.status(400).json(new ApiError(400, "Missing required fields: user_id, fcm_token, device_type"));
  }

  try {
    const query = { user_id, device_type };
    if (device_type !== "web") {
      query.device_id = device_id;
    } else {
      query.fcm_token = fcm_token;
    }

    const existingDevice = await FCMDevice.findOne(query);

    if (existingDevice) {
      existingDevice.fcm_token = fcm_token;
      await existingDevice.save();
      return res.status(200).json(new ApiResponse(200, {}, "FCM token updated successfully"));
    } else {
      await FCMDevice.create({
        user_id,
        fcm_token,
        device_type,
        device_id,
      });
      return res.status(201).json(new ApiResponse(201, {}, "FCM token created successfully"));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error creating FCM token"));
  }
});

/**
 * Admin user queries.
 */
uc.getAllUsers = asyncHandler(async (req, res) => {
  const { filter = {}, sortOrder = -1 } = req.body;
  const userRole = await UserRole.findOne({ name: "projectmanager" });

  let query = {};
  if (req.branchId) {
    query["branchAccess.branchId"] = req.branchId;
  }

  if (filter.type === "member" && userRole) {
    query.userRoles = { $nin: [userRole._id] };
  }

  const users = await User.find(query)
    .select("-password -refreshToken -otp -otpTime")
    .sort({ _id: sortOrder });

  return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

uc.getUserById = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.params.userId === "undefined") {
    return res.status(400).json(new ApiError(400, "User ID not provided"));
  }

  const user = await User.findById(req.params.userId).select("-password -refreshToken -otp -otpTime");

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

uc.updateUser = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.params.userId === "undefined") {
    return res.status(400).json(new ApiError(400, "User ID not provided"));
  }

  const { firstName, lastName, phoneNumber, address, profileImage, isActive } = req.body;

  let updateData = {
    ...(firstName && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(phoneNumber !== undefined && { phoneNumber }),
    ...(address !== undefined && { address }),
    ...(profileImage !== undefined && { profileImage }),
  };

  // Only allow updating isActive if explicitly passed
  if (typeof isActive === "boolean") {
    // Prevent deactivating Super Admin
    const targetUser = await User.findById(req.params.userId);
    if (targetUser && isSuperAdmin(targetUser) && !isActive) {
      return res.status(403).json(new ApiError(403, "Cannot deactivate the Super Admin"));
    }
    updateData.isActive = isActive;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.userId,
    { $set: updateData },
    { new: true }
  ).select("-password -refreshToken -otp -otpTime");

  if (!updatedUser) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

uc.bulkUpdateUserStatus = asyncHandler(async (req, res) => {
  const { userIds, isActive } = req.body;

  if (!userIds || !Array.isArray(userIds) || typeof isActive !== "boolean") {
    return res.status(400).json(new ApiError(400, "userIds array and isActive boolean are required"));
  }

  // Prevent blocking Super Admin
  let query = { _id: { $in: userIds }, role: { $ne: "SUPER_ADMIN" } };

  const result = await User.updateMany(query, { $set: { isActive } });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `Successfully ${isActive ? "enabled" : "disabled"} ${result.modifiedCount} users (Super Admins were protected)`
      )
    );
});

export default uc;
