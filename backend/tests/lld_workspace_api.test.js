/**
 * LLD Workspace API & Integration Test
 * 
 * Verifies:
 * 1. GET /api/tasks/:id/lld-workspace retrieves full context for versioned problems.
 * 2. GET /api/tasks/:id/lld-workspace retrieves full context for drills.
 * 3. Starter template extraction from markdown snippets vs fallback.
 * 4. Sibling version timeline and prev/next links.
 * 5. Multi-user isolation guarantee on submission:
 *    - User A submission creates/updates User A's UserTaskProgress.
 *    - User B has NO progress and sees clean default state.
 *    - Master Task document is NEVER mutated.
 * 6. Correction 1: Exit code 0 does NOT equal status "done" (remains "inprogress").
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function runTests() {
  console.log("================================================================================");
  console.log("🧪 RUNNING LLD WORKSPACE API & INTEGRATION TESTS");
  console.log("================================================================================");

  await mongoose.connect(process.env.MONGODB_URI);

  const { Task } = await import("../models/task.model.js");
  const { User } = await import("../models/user.model.js");
  const { UserTaskProgress } = await import("../models/userTaskProgress.model.js");
  const { generateLldStarterCode, getAllStarterTemplates } = await import("../services/judge/lld/lldTemplateGenerator.js");
  const { getLldWorkspaceContext, submitLldTaskProgress } = await import("../services/task-service/lldWorkspace.controller.js");

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      passed++;
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  }

  // --- TEST 1: Starter Template Generation ---
  test("Starter Code: Clean fallback templates for C++, Python, Java", () => {
    const templates = getAllStarterTemplates({});
    assert(templates.cpp.includes("#include <iostream>"), "C++ should include iostream");
    assert(templates.cpp.includes("int main()"), "C++ should include main");
    assert(templates.python.includes("def main():"), "Python should include def main");
    assert(templates.java.includes("public class Main"), "Java should include public class Main");
  });

  // --- TEST 2: Starter Code Extraction from Task Description ---
  await asyncTest("Starter Code: Extract code snippet from drill description", async () => {
    const drill = await Task.findOne({ taskId: "LLDP1-D1.1.1" }).lean();
    assert(drill, "LLDP1-D1.1.1 should exist");
    const cppCode = generateLldStarterCode({ task: drill, language: "cpp" });
    assert(cppCode.includes("TrackerBox"), "Extracted code should contain TrackerBox");
  });

  // --- TEST 3: Workspace Context Retrieval for Versioned Problem ---
  await asyncTest("Workspace Context: Problem Version (LLDP1-P1-V2)", async () => {
    const v2Task = await Task.findOne({ taskId: "LLDP1-P1-V2" }).lean();
    assert(v2Task, "LLDP1-P1-V2 should exist in DB");

    const req = { params: { id: "LLDP1-P1-V2" }, user: null };
    const responseData = await new Promise((resolve, reject) => {
      const res = {
        status: (code) => ({
          json: (payload) => {
            payload.statusCode = code;
            resolve(payload);
          }
        })
      };
      getLldWorkspaceContext(req, res, reject);
    });

    assert(responseData, "Response data should be returned");
    assert.strictEqual(responseData.statusCode, 200);

    const d = responseData.data;
    assert.strictEqual(d.isExecutable, true, "Problem version must be executable");
    assert.strictEqual(d.executionMode, "DIRECT_PROGRAM", "Mode must be DIRECT_PROGRAM");
    assert(d.parentProblem, "Should have parent major problem");
    assert.strictEqual(d.parentProblem.taskId, "LLDP1-P1");

    const vc = d.versionContext;
    assert.strictEqual(vc.isVersioned, true);
    assert.strictEqual(vc.totalVersions, 5);
    assert.strictEqual(vc.currentIndex, 1);
    assert.strictEqual(vc.previousVersion.taskId, "LLDP1-P1-V1");
    assert.strictEqual(vc.nextVersion.taskId, "LLDP1-P1-V3");
    assert.strictEqual(vc.allVersions.length, 5);
  });

  // --- TEST 4: Workspace Context Retrieval for Practical Drill ---
  await asyncTest("Workspace Context: Practical Drill (LLDP1-D1.1.1)", async () => {
    const req = { params: { id: "LLDP1-D1.1.1" }, user: null };
    const responseData = await new Promise((resolve, reject) => {
      const res = {
        status: (code) => ({
          json: (payload) => {
            payload.statusCode = code;
            resolve(payload);
          }
        })
      };
      getLldWorkspaceContext(req, res, reject);
    });

    assert.strictEqual(responseData.statusCode, 200);
    const d = responseData.data;
    assert.strictEqual(d.isExecutable, true);
    assert.strictEqual(d.executionMode, "DIRECT_PROGRAM");
    assert.strictEqual(d.versionContext.isVersioned, false);
    assert(d.parentUnit, "Drill should reference parent unit");
  });

  // --- TEST 5: Submission & Multi-User Isolation Guarantee ---
  await asyncTest("Submit Flow: Scoped to (userId, taskId), master Task untouched, exit 0 != done", async () => {
    const testTask = await Task.findOne({ taskId: "LLDP1-P1-V1" }).lean();
    assert(testTask, "LLDP1-P1-V1 must exist");

    const initialTaskUpdated = testTask.updatedAt;
    const initialTaskStatus = testTask.status;

    // Fake distinct users
    const userA_id = new mongoose.Types.ObjectId("6993047f16e85ff3e4efd9a1");
    const userB_id = new mongoose.Types.ObjectId("6993047f16e85ff3e4efd9b2");

    // Clean up any test records for User A and User B
    await UserTaskProgress.deleteMany({ userId: { $in: [userA_id, userB_id] }, taskId: testTask._id });

    // User A submits valid C++ Direct Program
    const userAReq = {
      params: { id: testTask.taskId },
      user: { _id: userA_id },
      body: {
        language: "cpp",
        code: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Vending Machine V1 Simulation" << endl;\n  return 0;\n}\n`
      }
    };
    const userAResponse = await new Promise((resolve, reject) => {
      const res = {
        status: (code) => ({
          json: (payload) => {
            payload.statusCode = code;
            resolve(payload);
          }
        })
      };
      submitLldTaskProgress(userAReq, res, reject);
    });
    assert(userAResponse, "User A submission response returned");
    assert.strictEqual(userAResponse.data.execution.status, "SUCCESS");
    assert(userAResponse.data.execution.stdout.includes("Vending Machine V1 Simulation"));

    // Verify User A progress record in DB
    const progA = await UserTaskProgress.findOne({ userId: userA_id, taskId: testTask._id }).lean();
    assert(progA, "User A progress must exist");
    // CORRECTION 1: Must NOT be 'done'
    assert.strictEqual(progA.status, "inprogress", "Correction 1: Status must be inprogress, NOT done");
    assert.strictEqual(progA.lldSubmissions.length, 1, "Should have 1 recorded submission");
    assert(progA.lastSubmittedCode.cpp, "User A's code must be preserved in lastSubmittedCode");

    // MULTI-USER ISOLATION: User B must have ZERO progress
    const progB = await UserTaskProgress.findOne({ userId: userB_id, taskId: testTask._id }).lean();
    assert.strictEqual(progB, null, "User B progress must be null (100% isolated)");

    // MASTER TASK IMMUTABILITY: Task document was NOT modified
    const currentTask = await Task.findById(testTask._id).lean();
    assert.strictEqual(currentTask.status, initialTaskStatus, "Master Task status must be untouched");
    assert.strictEqual(
      new Date(currentTask.updatedAt).getTime(),
      new Date(initialTaskUpdated).getTime(),
      "Master Task must have zero updates"
    );

    // Clean up test data
    await UserTaskProgress.deleteMany({ userId: { $in: [userA_id, userB_id] }, taskId: testTask._id });
  });

  console.log("\n================================================================================");
  console.log(`WORKSPACE API TESTS COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================================");

  await mongoose.disconnect();
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
