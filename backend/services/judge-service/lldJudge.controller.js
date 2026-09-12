import { LldDirectProgramExecutor } from "../judge/lld/LldDirectProgramExecutor.js";

/**
 * LLD Run Code Controller
 * Executes direct programs under the LLD execution profile without modifying DSA endpoints.
 */
export async function runLldCode(req, res) {
  try {
    const { language, code, executionLimits, strictSandboxMode } = req.body || {};

    const result = await LldDirectProgramExecutor.execute({
      language,
      code,
      executionLimits,
      strictSandboxMode: strictSandboxMode === true
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      status: "PROCESS_ERROR",
      executionTimeMs: 0,
      stdout: "",
      stderr: "",
      error: err.message || "Internal server error during LLD code execution."
    });
  }
}
