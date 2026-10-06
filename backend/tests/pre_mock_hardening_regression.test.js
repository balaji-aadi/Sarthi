import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Problem from "../models/problem.model.js";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import Company from "../models/company.model.js";
import { UserTaskProgress } from "../models/userTaskProgress.model.js";
import { DailyRevision } from "../models/dailyRevision.model.js";
import DsaPamphlet from "../models/dsaPamphlet.model.js";
import { getAllProblems, getProblemByIdOrSlug } from "../services/problem-service/problem.controller.js";
import { getDsaPamphlet } from "../services/pamphlet-service/pamphlet.controller.js";
import { PamphletSyncService } from "../services/pamphlet-service/pamphletSync.service.js";
import { questionFactoryService } from "../services/content-factory/questionFactory.service.js";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.data = body;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
    }
  };
  return res;
}

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runRegressionSuite() {
  console.log("\n==================================================");
  console.log("SARTHI DSA PRE-MOCK HARDENING REGRESSION TEST SUITE");
  console.log("==================================================\n");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for regression verification.\n");

  // Pre-snapshot baseline counts
  const initialPublishedCount = await Problem.countDocuments({ status: "Published" });
  const initialDraftCount = await Problem.countDocuments({ status: "Draft" });
  const initialReviewCount = await Problem.countDocuments({ status: "Review" });
  const initialTaskCount = await Task.countDocuments({});
  const initialCompanyCount = await Company.countDocuments({});
  const initialProjectCount = await Project.countDocuments({});
  const initialRevisionCount = await DailyRevision.countDocuments({});

  console.log(`[Baseline Snapshot] Problems: ${initialPublishedCount} Published, ${initialDraftCount} Draft, ${initialReviewCount} Review.`);
  console.log(`[Baseline Snapshot] Tasks: ${initialTaskCount}, Companies: ${initialCompanyCount}, Projects: ${initialProjectCount}, Revisions: ${initialRevisionCount}.\n`);

  // Mock normal user and admin user
  const normalUser = {
    _id: new mongoose.Types.ObjectId(),
    email: "student_candidate@example.com",
    role: "student",
    userRole: { name: "student" },
    firstName: "Alice",
    lastName: "Student",
    phoneNumber: "9876543210"
  };

  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    email: "balajiaadi2000@gmail.com",
    role: "admin",
    userRole: { name: "admin" },
    firstName: "Balaji",
    lastName: "Admin",
    phoneNumber: "1234567890"
  };

  // ----------------------------------------------------
  // Test A: Unauthenticated problem listing & access
  // ----------------------------------------------------
  console.log("--- Test A: Problem Access Controls & Auth Requirement ---");
  {
    // A mock request without user or token
    const req = { query: {}, user: null };
    const res = createMockRes();
    await getAllProblems(req, res);
    // Non-admin query treats unauthenticated as non-admin, returning only Published problems
    assert(res.statusCode === 200, "getAllProblems handles unauthenticated request by restricting status to Published");
    const returnedItems = res.data?.data || [];
    const nonPublished = returnedItems.filter(p => p.status !== "Published");
    assert(nonPublished.length === 0, "No non-published problems returned to unauthenticated requester");
  }

  // ----------------------------------------------------
  // Test B: Authenticated normal user problem listing
  // ----------------------------------------------------
  console.log("\n--- Test B: Authenticated Normal User Problem Listing ---");
  {
    // Normal user attempts to pass query status=Draft
    const req = { query: { status: "Draft" }, user: normalUser };
    const res = createMockRes();
    await getAllProblems(req, res);
    assert(res.statusCode === 200, "Normal user query returned status 200");
    const items = res.data?.data || [];
    assert(items.every(p => p.status === "Published"), "Normal user query ignores status=Draft override and returns ONLY Published");
    assert(items.every(p => p.problemType !== "Mock_Interview"), "Normal user query NEVER returns Mock_Interview problems");
  }

  // ----------------------------------------------------
  // Test C: Admin problem listing
  // ----------------------------------------------------
  console.log("\n--- Test C: Admin Problem Listing ---");
  {
    const req = { query: { status: "Draft" }, user: adminUser };
    const res = createMockRes();
    await getAllProblems(req, res);
    assert(res.statusCode === 200, "Admin query returned status 200");
    const items = res.data?.data || [];
    assert(items.every(p => p.status === "Draft"), "Admin can query Draft problems for CMS management");
  }

  // ----------------------------------------------------
  // Test D: Draft visibility
  // ----------------------------------------------------
  console.log("\n--- Test D: Draft Problem Direct Visibility ---");
  {
    const existingDraft = await Problem.findOne({ status: "Draft" });
    if (existingDraft) {
      // Normal user query
      const reqNormal = { params: { identifier: existingDraft.slug }, query: {}, user: normalUser };
      const resNormal = createMockRes();
      await getProblemByIdOrSlug(reqNormal, resNormal);
      assert(resNormal.statusCode === 404, "Draft problem is inaccessible to normal user (returns 404)");

      // Admin query
      const reqAdmin = { params: { identifier: existingDraft.slug }, query: {}, user: adminUser };
      const resAdmin = createMockRes();
      await getProblemByIdOrSlug(reqAdmin, resAdmin);
      assert(resAdmin.statusCode === 200 && resAdmin.data?.data?._id.toString() === existingDraft._id.toString(), "Draft problem is accessible to Admin (returns 200)");
    } else {
      console.log("  [Skip] No draft found in database");
    }
  }

  // ----------------------------------------------------
  // Test E: Review visibility
  // ----------------------------------------------------
  console.log("\n--- Test E: Review Problem Direct Visibility ---");
  {
    const existingReview = await Problem.findOne({ status: "Review" });
    if (existingReview) {
      // Normal user query
      const reqNormal = { params: { identifier: existingReview.slug }, query: {}, user: normalUser };
      const resNormal = createMockRes();
      await getProblemByIdOrSlug(reqNormal, resNormal);
      assert(resNormal.statusCode === 404, "Review problem is inaccessible to normal user (returns 404)");

      // Admin query
      const reqAdmin = { params: { identifier: existingReview.slug }, query: {}, user: adminUser };
      const resAdmin = createMockRes();
      await getProblemByIdOrSlug(reqAdmin, resAdmin);
      assert(resAdmin.statusCode === 200, "Review problem is accessible to Admin (returns 200)");
    } else {
      console.log("  [Skip] No review problem found in database");
    }
  }

  // ----------------------------------------------------
  // Test F: Mock_Ready visibility
  // ----------------------------------------------------
  console.log("\n--- Test F: Mock_Ready & Mock-Exclusive Visibility ---");
  {
    const tempMockProblem = await Problem.create({
      problemCode: "TEST-MOCK-999",
      problemType: "Mock_Interview",
      title: "Temporary Mock Test Problem",
      slug: "temp-mock-test-problem-regress",
      difficulty: "Medium",
      status: "Mock_Ready",
      descriptionMarkdown: "Description for test mock problem",
      factoryMetadata: {
        isMockExclusive: true,
        source: "QUESTION_FACTORY"
      }
    });

    try {
      // Normal user query
      const reqNormal = { params: { identifier: tempMockProblem.slug }, query: {}, user: normalUser };
      const resNormal = createMockRes();
      await getProblemByIdOrSlug(reqNormal, resNormal);
      assert(resNormal.statusCode === 404, "Mock_Ready problem is completely hidden from normal student API (returns 404)");

      // Admin query
      const reqAdmin = { params: { identifier: tempMockProblem.slug }, query: {}, user: adminUser };
      const resAdmin = createMockRes();
      await getProblemByIdOrSlug(reqAdmin, resAdmin);
      assert(resAdmin.statusCode === 200, "Mock_Ready problem is visible to Admin inspection");
    } finally {
      await Problem.deleteOne({ _id: tempMockProblem._id });
    }
  }

  // ----------------------------------------------------
  // Test G: Hidden test exclusion
  // ----------------------------------------------------
  console.log("\n--- Test G: Hidden Test Protection & Stripping ---");
  {
    const publishedProblem = await Problem.findOne({ status: "Published", problemCode: "DSA-001" });
    if (publishedProblem) {
      // Normal user query
      const reqNormal = { params: { identifier: publishedProblem.slug }, query: {}, user: normalUser };
      const resNormal = createMockRes();
      await getProblemByIdOrSlug(reqNormal, resNormal);
      assert(resNormal.statusCode === 200, "Published problem fetched successfully");
      assert(resNormal.data?.data?.hiddenTestCases === undefined, "Student payload NEVER exposes hiddenTestCases");

      // Admin query without includeHidden
      const reqAdminNoHidden = { params: { identifier: publishedProblem.slug }, query: {}, user: adminUser };
      const resAdminNoHidden = createMockRes();
      await getProblemByIdOrSlug(reqAdminNoHidden, resAdminNoHidden);
      assert(resAdminNoHidden.data?.data?.hiddenTestCases === undefined, "Admin payload without includeHidden flag also excludes hiddenTestCases");

      // Admin query with includeHidden=true
      const reqAdminWithHidden = { params: { identifier: publishedProblem.slug }, query: { includeHidden: "true" }, user: adminUser };
      const resAdminWithHidden = createMockRes();
      await getProblemByIdOrSlug(reqAdminWithHidden, resAdminWithHidden);
      assert(Array.isArray(resAdminWithHidden.data?.data?.hiddenTestCases) && resAdminWithHidden.data.data.hiddenTestCases.length > 0, "Admin can explicitly request hiddenTestCases via authorized query parameter");
    }
  }

  // ----------------------------------------------------
  // Test H: Judge hidden-test access
  // ----------------------------------------------------
  console.log("\n--- Test H: Judge Server-Side Hidden Test Access ---");
  {
    // The Judge query uses Problem.findOne(query).select('+hiddenTestCases')
    const judgeLoadedProblem = await Problem.findOne({ problemCode: "DSA-001" }).select("+hiddenTestCases");
    assert(Array.isArray(judgeLoadedProblem?.hiddenTestCases) && judgeLoadedProblem.hiddenTestCases.length > 0, "Judge query with .select('+hiddenTestCases') loads hidden test cases server-side for execution");
  }

  // ----------------------------------------------------
  // Test I & J: Pamphlet User A and User B Isolation
  // ----------------------------------------------------
  console.log("\n--- Test I & J: Pamphlet User-Progress Isolation ---");
  {
    const userAId = new mongoose.Types.ObjectId();
    const userBId = new mongoose.Types.ObjectId();

    // Find an active DSA project and a task belonging to a recognized pattern (e.g., Sliding Window)
    const dsaProject = await Project.findOne({ key: /DSA/i });
    const parentTask = await Task.findOne({ projectName: dsaProject?._id, parentTask: null, taskName: /sliding window/i });
    const targetTask = await Task.findOne({ projectName: dsaProject?._id, parentTask: parentTask?._id });

    if (dsaProject && targetTask) {
      // User A completed this task
      const progressA = await UserTaskProgress.create({
        userId: userAId,
        taskId: targetTask._id,
        projectName: dsaProject._id,
        status: "done",
        progress: 100,
        completedAt: new Date()
      });

      // User B has not completed this task (in progress)
      const progressB = await UserTaskProgress.create({
        userId: userBId,
        taskId: targetTask._id,
        projectName: dsaProject._id,
        status: "inprogress",
        progress: 30
      });

      try {
        const pamphletA = await PamphletSyncService.syncUserPamphlet(userAId.toString());
        const pamphletB = await PamphletSyncService.syncUserPamphlet(userBId.toString());

        // Locate arena problem in pamphlet A
        let problemStatusA = null;
        for (const p of pamphletA.patterns) {
          for (const arena of p.userProgress?.matchedArenas || []) {
            const prob = arena.problems?.find(pr => pr.taskId.toString() === targetTask._id.toString() || pr.taskId === targetTask.taskId);
            if (prob) {
              problemStatusA = prob;
              break;
            }
          }
          if (problemStatusA) break;
        }

        // Locate arena problem in pamphlet B
        let problemStatusB = null;
        for (const p of pamphletB.patterns) {
          for (const arena of p.userProgress?.matchedArenas || []) {
            const prob = arena.problems?.find(pr => pr.taskId.toString() === targetTask._id.toString() || pr.taskId === targetTask.taskId);
            if (prob) {
              problemStatusB = prob;
              break;
            }
          }
          if (problemStatusB) break;
        }

        assert(problemStatusA?.isCompleted === true, "User A pamphlet marks completed task as isCompleted=true");
        assert(problemStatusB?.isCompleted === false, "User B pamphlet correctly marks same task as isCompleted=false");
        assert(problemStatusA?.status === "done", "User A problem status is 'done'");
        assert(problemStatusB?.status === "inprogress", "User B problem status is 'inprogress'");
      } finally {
        await UserTaskProgress.deleteMany({ _id: { $in: [progressA._id, progressB._id] } });
        // Clean up test user progress from DsaPamphlet documents
        await DsaPamphlet.updateMany(
          {},
          { $pull: { userProgress: { userId: { $in: [userAId, userBId] } } } }
        );
      }
    }
  }

  // ----------------------------------------------------
  // Test K: Missing-auth pamphlet request
  // ----------------------------------------------------
  console.log("\n--- Test K: Missing-Auth Pamphlet Request Returns 401 ---");
  {
    const req = { user: null };
    const res = createMockRes();
    await getDsaPamphlet(req, res);
    assert(res.statusCode === 401, "getDsaPamphlet returns 401 Unauthorized when req.user is missing");
    assert(res.data?.success === false, "Pamphlet request without auth does not fall back to Admin ID");
  }

  // ----------------------------------------------------
  // Test L: Factory approval lifecycle
  // ----------------------------------------------------
  console.log("\n--- Test L: Content Factory -> Mock-Only Approval Lifecycle ---");
  {
    // Create a temporary validated draft problem
    const testDraft = await Problem.create({
      problemCode: "DRAFT-TEST-9999",
      problemType: "DSA",
      title: "Temporary Validation Lifecycle Test Problem",
      slug: "temp-validation-lifecycle-test-problem",
      difficulty: "Medium",
      status: "Draft",
      descriptionMarkdown: "Markdown description for lifecycle test",
      functionDefinition: {
        functionName: "solveTest",
        parameters: [{ name: "nums", type: "number[]" }],
        returnType: "number"
      },
      executionProfile: {
        runtimeType: "FUNCTION",
        outputSerializer: "PrimitiveSerializer",
        comparator: "ExactMatch"
      },
      referenceSolution: {
        language: "python",
        code: "def solveTest(nums):\n    return sum(nums)"
      },
      factoryMetadata: {
        source: "QUESTION_FACTORY",
        validationReport: {
          validationState: "VALIDATED",
          isValidated: true,
          judgeSelfTestPassed: true,
          constraintAuditPassed: true,
          performanceStatus: "OPTIMAL"
        }
      }
    });

    try {
      const approvedDraft = await questionFactoryService.approveDraft(testDraft._id.toString(), {
        reviewedBy: adminUser._id,
        adminNotes: "Approved for future mock interview tests"
      });

      assert(approvedDraft.status === "Mock_Ready", "Approved Factory problem status set to 'Mock_Ready'");
      assert(approvedDraft.problemType === "Mock_Interview", "Approved Factory problem problemType set to 'Mock_Interview'");
      assert(approvedDraft.factoryMetadata?.isMockExclusive === true, "Approved Factory problem marked isMockExclusive=true");
      assert(/^MOCK-\d{3,}$/.test(approvedDraft.problemCode), `Approved Factory problem receives MOCK-xxx problemCode: ${approvedDraft.problemCode}`);
      assert(!approvedDraft.problemCode.startsWith("DSA-"), "Approved Factory problem DOES NOT consume DSA-xxx namespace");
    } finally {
      await Problem.deleteOne({ _id: testDraft._id });
    }
  }

  // ----------------------------------------------------
  // Test M: Existing DSA-001..DSA-017 unchanged
  // ----------------------------------------------------
  console.log("\n--- Test M: Verify Existing Published DSA-001..DSA-017 Unchanged ---");
  {
    const publishedDsaProblems = await Problem.find({ problemCode: /^DSA-\d+$/, status: "Published" }).sort({ problemCode: 1 });
    assert(publishedDsaProblems.length === 16, `Exactly 16 published DSA problems exist (actual: ${publishedDsaProblems.length})`);
    
    // Check key codes
    const codes = publishedDsaProblems.map(p => p.problemCode);
    assert(codes.includes("DSA-001"), "DSA-001 is present");
    assert(codes.includes("DSA-015"), "DSA-015 is present");
    assert(codes.includes("DSA-017"), "DSA-017 is present");
    assert(!codes.includes("DSA-016"), "DSA-016 remains skipped historically as expected");
  }

  // ----------------------------------------------------
  // Test N: Existing drafts unchanged
  // ----------------------------------------------------
  console.log("\n--- Test N: Verify Existing Drafts Unchanged ---");
  {
    const drafts = await Problem.find({ status: "Draft" });
    const reviews = await Problem.find({ status: "Review" });
    assert(drafts.length === initialDraftCount, `Draft count remains exactly ${initialDraftCount} (actual: ${drafts.length})`);
    assert(reviews.length === initialReviewCount, `Review count remains exactly ${initialReviewCount} (actual: ${reviews.length})`);
  }

  // ----------------------------------------------------
  // Test O: JWT claim names
  // ----------------------------------------------------
  console.log("\n--- Test O: JWT Claim Naming (firstName, lastName, phoneNumber) ---");
  {
    const userInstance = new User({
      firstName: "Rohan",
      lastName: "Verma",
      email: "rohan.verma@example.com",
      phoneNumber: "9876543210"
    });

    const token = userInstance.generateAccessToken();
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    assert(decoded.firstName === "Rohan", "JWT contains camelCase claim firstName");
    assert(decoded.lastName === "Verma", "JWT contains camelCase claim lastName");
    assert(decoded.phoneNumber === "9876543210", "JWT contains camelCase claim phoneNumber");
    assert(decoded.first_name === "Rohan", "JWT maintains backward-compatible alias first_name");
    assert(decoded.last_name === "Verma", "JWT maintains backward-compatible alias last_name");
    assert(decoded.phone_number === "9876543210", "JWT maintains backward-compatible alias phone_number");
  }

  // ----------------------------------------------------
  // Post-Verification Database Snapshot Integrity
  // ----------------------------------------------------
  console.log("\n--- Post-Verification Database Integrity Verification ---");
  {
    const finalPublishedCount = await Problem.countDocuments({ status: "Published" });
    const finalDraftCount = await Problem.countDocuments({ status: "Draft" });
    const finalReviewCount = await Problem.countDocuments({ status: "Review" });
    const finalTaskCount = await Task.countDocuments({});
    const finalCompanyCount = await Company.countDocuments({});
    const finalProjectCount = await Project.countDocuments({});
    const finalRevisionCount = await DailyRevision.countDocuments({});

    assert(finalPublishedCount === initialPublishedCount, `Published problem count preserved (${initialPublishedCount})`);
    assert(finalDraftCount === initialDraftCount, `Draft problem count preserved (${initialDraftCount})`);
    assert(finalReviewCount === initialReviewCount, `Review problem count preserved (${initialReviewCount})`);
    assert(finalTaskCount === initialTaskCount, `Task count preserved (${initialTaskCount})`);
    assert(finalCompanyCount === initialCompanyCount, `Company count preserved (${initialCompanyCount})`);
    assert(finalProjectCount === initialProjectCount, `Project count preserved (${initialProjectCount})`);
    assert(finalRevisionCount === initialRevisionCount, `DailyRevision count preserved (${initialRevisionCount})`);
  }

  console.log("\n==================================================");
  console.log(`TEST SUITE RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("==================================================\n");

  await mongoose.disconnect();

  if (failCount > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error("Test Suite Execution Fatal Error:", err);
  process.exit(1);
});
