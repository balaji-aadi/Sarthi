import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

/**
 * Safely updates an environment variable on disk (backend/.env) and in process.env.
 *
 * ARCHITECTURAL DEPLOYMENT LIMITATION:
 * Runtime mutation of backend/.env is appropriate ONLY for single-backend-instance V1 deployments.
 * In horizontally scaled multi-instance deployments (e.g., Kubernetes, ECS, serverless),
 * environment variables are isolated per container/process, so changes in one container do not
 * propagate to others. A distributed cluster must use an external secret/configuration store
 * (e.g., HashiCorp Vault, AWS Secrets Manager, or MongoDB SystemState singleton).
 *
 * SECURITY INVARIANTS:
 * - Never prints or logs the value.
 * - Performs atomic verification of the written content before mutating process.env.
 * - Returns false if file write or verification fails, preventing silent configuration divergence.
 *
 * @param {string} key
 * @param {string} value
 * @returns {boolean} true if persisted and verified; false otherwise
 */
export const updateEnvConfig = (key, value) => {
  if (!key || typeof key !== "string" || typeof value !== "string") {
    return false;
  }

  try {
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf8");
    }

    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content = content.trimEnd() + `\n${key}=${value}\n`;
    }

    fs.writeFileSync(envPath, content, "utf8");

    // Verify disk write succeeded
    const verifiedContent = fs.readFileSync(envPath, "utf8");
    if (!verifiedContent.includes(`${key}=${value}`)) {
      return false;
    }

    // Only update in-memory process environment after confirmed persistence
    process.env[key] = value;
    return true;
  } catch (err) {
    // Intentionally omit sensitive value from error output
    console.error(`[EnvHelper] Failed to persist ${key} to disk:`, err.message);
    return false;
  }
};
