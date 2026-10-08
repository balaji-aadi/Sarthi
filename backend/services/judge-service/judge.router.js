import { Router } from "express";
import { runCode, submitCode, getJobStatus, getMetrics } from "./judge.controller.js";
import { runLldCode } from "./lldJudge.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Run Code API (DSA LeetCode Function Model - Authenticated)
router.post("/run", verifyJWT, runCode);

// LLD Run Code API (LLD Direct Program Model - Authenticated)
router.post("/lld/run", verifyJWT, runLldCode);

// Submit Code API (Authenticated, ownership strictly bound to req.user._id)
router.post("/submit", verifyJWT, submitCode);

// Async Execution Job Status Polling API (Phase 11 - Authenticated)
router.get("/jobs/:jobId", verifyJWT, getJobStatus);

// Internal Prometheus Metrics API (Phase 12)
router.get("/metrics", getMetrics);

export default router;
