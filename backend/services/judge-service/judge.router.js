import { Router } from "express";
import { runCode, submitCode, getJobStatus, getMetrics } from "./judge.controller.js";
import { runLldCode } from "./lldJudge.controller.js";

const router = Router();

// Run Code API (DSA LeetCode Function Model)
router.post("/run", runCode);

// LLD Run Code API (LLD Direct Program Model)
router.post("/lld/run", runLldCode);

// Submit Code API
router.post("/submit", submitCode);

// Async Execution Job Status Polling API (Phase 11)
router.get("/jobs/:jobId", getJobStatus);

// Internal Prometheus Metrics API (Phase 12)
router.get("/metrics", getMetrics);

export default router;
