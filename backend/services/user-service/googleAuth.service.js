import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Authoritatively verifies a Google ID token.
 * Validates:
 * - signature
 * - audience (must match GOOGLE_CLIENT_ID)
 * - issuer (accounts.google.com or https://accounts.google.com)
 * - expiration
 * - presence of sub (Google's unique, stable user ID)
 *
 * @param {string} idToken - Raw Google ID token provided by Google Identity Services
 * @returns {Promise<{ sub: string, email: string, name: string, firstName: string, lastName: string, picture: string, emailVerified: boolean }>}
 */
let testTokenVerifier = null;

export const setCustomTokenVerifierForTesting = (verifier) => {
  testTokenVerifier = verifier;
};

export const verifyGoogleIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== "string") {
    throw new ApiError(400, "Google ID token is required");
  }

  if (testTokenVerifier) {
    return await testTokenVerifier(idToken);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new ApiError(500, "GOOGLE_CLIENT_ID is not configured on the server");
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new ApiError(401, "Invalid Google token payload");
    }

    const {
      sub,
      email,
      email_verified,
      name,
      given_name,
      family_name,
      picture,
      iss,
    } = payload;

    // Verify issuer explicitly
    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!iss || !validIssuers.includes(iss)) {
      throw new ApiError(401, "Invalid Google token issuer");
    }

    // Google sub is mandatory
    if (!sub) {
      throw new ApiError(401, "Google token missing 'sub' identifier");
    }

    if (!email) {
      throw new ApiError(401, "Google token missing email claim");
    }

    return {
      sub,
      email: email.toLowerCase().trim(),
      name: name || "",
      firstName: given_name || name || "User",
      lastName: family_name || "",
      picture: picture || null,
      emailVerified: Boolean(email_verified),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, `Google token verification failed: ${error.message}`);
  }
};
