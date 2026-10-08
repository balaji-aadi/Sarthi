import { whiteListCors } from "../config/cors.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Focused CSRF Protection Middleware
 * Protects cookie-authenticated state-changing requests (POST, PUT, PATCH, DELETE)
 * by verifying the Origin or Referer header against whitelisted origins.
 */
export const csrfProtection = (req, res, next) => {
  const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!stateChangingMethods.includes(req.method)) {
    return next();
  }

  // If no auth cookies are present, CSRF cannot exploit ambient cookie credentials
  const hasAuthCookies = Boolean(req.cookies?.accessToken || req.cookies?.refreshToken);
  if (!hasAuthCookies) {
    return next();
  }

  const origin = req.headers["origin"];
  const referer = req.headers["referer"];

  let requestOrigin = origin;
  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      requestOrigin = null;
    }
  }

  // When browser-managed auth cookies are present on state-changing requests, verify origin
  if (requestOrigin) {
    const isWhitelisted =
      whiteListCors.includes(requestOrigin) ||
      /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(requestOrigin);

    if (!isWhitelisted) {
      return res.status(403).json(new ApiError(403, "CSRF check failed: Untrusted Origin"));
    }
  }

  next();
};
