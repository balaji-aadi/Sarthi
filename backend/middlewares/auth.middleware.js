import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";

/**
 * Authoritative JWT verification middleware with single-active-session and blocked-user enforcement.
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json(new ApiError(401, "Unauthorized: No token provided"));
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (jwtErr) {
      return res.status(401).json(new ApiError(401, `Invalid or expired access token: ${jwtErr.message}`));
    }

    if (!decodedToken?._id) {
      return res.status(401).json(new ApiError(401, "Malformed token payload"));
    }

    const user = await User.findById(decodedToken._id)
      .select("-password -refreshToken -otp -otpTime")
      .populate("userRole")
      .populate("userRoles");

    if (!user) {
      return res.status(401).json(new ApiError(401, "User not found"));
    }

    // 1. Blocked User Check
    if (user.isActive === false) {
      return res.status(403).json(new ApiError(403, "Your account has been deactivated or blocked"));
    }

    // 2. Single-Active-Device / Session Version Check
    if (
      decodedToken.sessionVersion !== undefined &&
      user.sessionVersion !== undefined &&
      decodedToken.sessionVersion !== user.sessionVersion
    ) {
      return res.status(401).json(
        new ApiError(401, "Session invalidated: You have logged in on another device")
      );
    }

    // 3. Session Store Active Check (if sessionId present in token)
    if (decodedToken.sessionId) {
      const activeSession = await Session.findOne({
        sessionId: decodedToken.sessionId,
        isActive: true,
      });

      if (!activeSession) {
        return res.status(401).json(
          new ApiError(401, "Session has been invalidated, expired, or logged out")
        );
      }

      req.session = activeSession;
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(new ApiError(401, error?.message || "Authentication error"));
  }
});

/**
 * Optional JWT verification: attaches req.user if valid and active, null otherwise.
 */
export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      req.user = null;
      return next();
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      req.user = null;
      return next();
    }

    if (!decodedToken?._id) {
      req.user = null;
      return next();
    }

    const user = await User.findById(decodedToken._id)
      .select("-password -refreshToken -otp -otpTime")
      .populate("userRole")
      .populate("userRoles");

    if (!user || user.isActive === false) {
      req.user = null;
      return next();
    }

    if (
      decodedToken.sessionVersion !== undefined &&
      user.sessionVersion !== undefined &&
      decodedToken.sessionVersion !== user.sessionVersion
    ) {
      req.user = null;
      return next();
    }

    if (decodedToken.sessionId) {
      const activeSession = await Session.findOne({
        sessionId: decodedToken.sessionId,
        isActive: true,
      });
      if (!activeSession) {
        req.user = null;
        return next();
      }
      req.session = activeSession;
    }

    req.user = user;
    next();
  } catch {
    req.user = null;
    next();
  }
});