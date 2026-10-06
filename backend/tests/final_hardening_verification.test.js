import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import Problem from "../models/problem.model.js";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import Company from "../models/company.model.js";
import { UserTaskProgress } from "../models/userTaskProgress.model.js";
import { DailyRevision } from "../models/dailyRevision.model.js";
import DsaPamphlet from "../models/dsaPamphlet.model.js";
import { questionFactoryService } from "../services/content-factory/questionFactory.service.js";
import { PamphletSyncService } from "../services/pamphlet-service/pamphletSync.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BASE_URL = `http://localhost:${process.env.PORT || 5003}/api/v1`;

let passCount = 0;
let failCount = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failCount++;
    failures.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runFinalVerification() {
  console.log("\n=====================================================================");
  console.log("SARTHI DSA — PRE-MOCK HARDENING FINAL VERIFICATION SUITE");
  console.log("=====================================================================\n");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for final verification.\n");

  // =================================================================
  // BASELINE SNAPSHOT
  // =================================================================
  const baseline = {
    totalProblems: await Problem.countDocuments({}),
    publishedProblems: await Problem.countDocuments({ status: "Published" }),
    draftProblems: await Problem.countDocuments({ status: "Draft" }),
    reviewProblems: await Problem.countDocuments({ status: "Review" }),
    archivedProblems: await Problem.countDocuments({ status: "Archived" }),
    tasks: await Task.countDocuments({}),
    projects: await Project.countDocuments({}),
    companies: await Company.countDocuments({}),
    dailyRevisions: await DailyRevision.countDocuments({}),
    userTaskProgress: await UserTaskProgress.countDocuments({})
  };

  console.log("=== PRE-VERIFICATION BASELINE SNAPSHOT ===");
  console.log(`Problems: ${baseline.totalProblems} (Published: ${baseline.publishedProblems}, Draft: ${baseline.draftProblems}, Review: ${baseline.reviewProblems}, Archived: ${baseline.archivedProblems})`);
  console.log(`Tasks: ${baseline.tasks}`);
  console.log(`Projects: ${baseline.projects}`);
  console.log(`Companies: ${baseline.companies}`);
  console.log(`DailyRevision: ${baseline.dailyRevisions}`);
  console.log(`UserTaskProgress: ${baseline.userTaskProgress}\n`);

  // Tokens for HTTP tests
  const adminUser = await User.findOne({ email: "balajiaadi2000@gmail.com" });
  const studentUser = await User.findOne({ email: "test@gmail.com" });

  if (!adminUser || !studentUser) {
    throw new Error("Admin user or Student user missing from database.");
  }

  const adminToken = jwt.sign({ _id: adminUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
  const studentToken = jwt.sign({ _id: studentUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

  // =================================================================
  // 1. REAL HTTP ROUTE AUTHENTICATION
  // =================================================================
  console.log("=================================================================");
  console.log("1. REAL HTTP ROUTE AUTHENTICATION (Express /api/v1/problem/)");
  console.log("=================================================================");

  // Case A: No Authorization header/cookie
  {
    const resList = await fetch(`${BASE_URL}/problem/`);
    assert(resList.status === 401, "GET /api/v1/problem/ without auth returns HTTP 401 Unauthorized");

    const resSingle = await fetch(`${BASE_URL}/problem/two-sum`);
    assert(resSingle.status === 401, "GET /api/v1/problem/:identifier without auth returns HTTP 401 Unauthorized");
  }

  // Case B: Invalid JWT
  {
    const resList = await fetch(`${BASE_URL}/problem/`, {
      headers: { Authorization: "Bearer bad.token.signature" }
    });
    assert(resList.status === 403 || resList.status === 401, "GET /api/v1/problem/ with invalid JWT returns 401/403");

    const resSingle = await fetch(`${BASE_URL}/problem/two-sum`, {
      headers: { Authorization: "Bearer bad.token.signature" }
    });
    assert(resSingle.status === 403 || resSingle.status === 401, "GET /api/v1/problem/:identifier with invalid JWT returns 401/403");
  }

  // Case C: Normal authenticated user
  {
    const resList = await fetch(`${BASE_URL}/problem/`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataList = await resList.json();
    assert(resList.status === 200, "Normal authenticated student can access GET /api/v1/problem/");
    const items = dataList.data || [];
    assert(items.length === 16, `Student receives exactly 16 published problems (received: ${items.length})`);
    assert(items.every(p => p.status === "Published"), "All items returned to student have status === 'Published'");
    assert(items.every(p => p.problemType !== "Mock_Interview"), "Zero Mock_Interview problems returned to student");
    assert(items.every(p => p.factoryMetadata?.isMockExclusive !== true), "Zero Mock-exclusive problems returned to student");

    // Student query attempting status=Draft override
    const resDraftQuery = await fetch(`${BASE_URL}/problem/?status=Draft`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataDraftQuery = await resDraftQuery.json();
    assert(dataDraftQuery.data?.every(p => p.status === "Published"), "Student query with ?status=Draft is ignored and returns ONLY Published");

    // Student direct lookup of existing draft
    const existingDraft = await Problem.findOne({ status: "Draft" });
    if (existingDraft) {
      const resDraftLookup = await fetch(`${BASE_URL}/problem/${existingDraft.slug}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert(resDraftLookup.status === 404, `Student lookup of Draft problem (${existingDraft.slug}) returns 404 Not Found`);
    }

    // Student direct lookup of existing review question
    const existingReview = await Problem.findOne({ status: "Review" });
    if (existingReview) {
      const resReviewLookup = await fetch(`${BASE_URL}/problem/${existingReview.slug}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert(resReviewLookup.status === 404, `Student lookup of Review problem (${existingReview.slug}) returns 404 Not Found`);
    }
  }

  // Case D: Admin authenticated user
  {
    const resAdminDrafts = await fetch(`${BASE_URL}/problem/?status=Draft`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dataAdminDrafts = await resAdminDrafts.json();
    assert(resAdminDrafts.status === 200, "Admin can query problems with ?status=Draft");
    assert(dataAdminDrafts.data?.length === 10, `Admin successfully retrieves all 10 CMS Drafts (retrieved: ${dataAdminDrafts.data?.length})`);

    const existingDraft = await Problem.findOne({ status: "Draft" });
    if (existingDraft) {
      const resAdminDraftLookup = await fetch(`${BASE_URL}/problem/${existingDraft.slug}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(resAdminDraftLookup.status === 200, `Admin direct lookup of Draft problem returns 200 OK`);
    }
  }

  // =================================================================
  // 2. FINAL USER TASK PROGRESS DB INTEGRITY
  // =================================================================
  console.log("\n=================================================================");
  console.log("2. FINAL USER TASK PROGRESS DB INTEGRITY");
  console.log("=================================================================");

  const utpCountBefore = await UserTaskProgress.countDocuments({});
  console.log(`UserTaskProgress count before isolation test: ${utpCountBefore}`);

  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  const dsaProject = await Project.findOne({ key: /DSA/i });
  const parentTask = await Task.findOne({ projectName: dsaProject?._id, parentTask: null, taskName: /sliding window/i });
  const targetTask = await Task.findOne({ projectName: dsaProject?._id, parentTask: parentTask?._id });

  let tempUtpA = null;
  let tempUtpB = null;

  try {
    tempUtpA = await UserTaskProgress.create({
      userId: userAId,
      taskId: targetTask._id,
      projectName: dsaProject._id,
      status: "done",
      progress: 100,
      completedAt: new Date()
    });

    tempUtpB = await UserTaskProgress.create({
      userId: userBId,
      taskId: targetTask._id,
      projectName: dsaProject._id,
      status: "inprogress",
      progress: 40
    });

    const pamphletA = await PamphletSyncService.syncUserPamphlet(userAId.toString());
    const pamphletB = await PamphletSyncService.syncUserPamphlet(userBId.toString());

    // Locate problem in pamphlet A
    let taskInPamphletA = null;
    for (const p of pamphletA.patterns) {
      for (const arena of p.userProgress?.matchedArenas || []) {
        const found = arena.problems?.find(pr => pr.taskId.toString() === targetTask._id.toString() || pr.taskId === targetTask.taskId);
        if (found) {
          taskInPamphletA = found;
          break;
        }
      }
      if (taskInPamphletA) break;
    }

    // Locate problem in pamphlet B
    let taskInPamphletB = null;
    for (const p of pamphletB.patterns) {
      for (const arena of p.userProgress?.matchedArenas || []) {
        const found = arena.problems?.find(pr => pr.taskId.toString() === targetTask._id.toString() || pr.taskId === targetTask.taskId);
        if (found) {
          taskInPamphletB = found;
          break;
        }
      }
      if (taskInPamphletB) break;
    }

    assert(taskInPamphletA?.isCompleted === true, "User A pamphlet marks task as isCompleted=true");
    assert(taskInPamphletB?.isCompleted === false, "User B pamphlet marks same task as isCompleted=false");
    assert(taskInPamphletA?.status === "done", "User A status is 'done'");
    assert(taskInPamphletB?.status === "inprogress", "User B status is 'inprogress'");
  } finally {
    // Clean all temporary records
    if (tempUtpA) await UserTaskProgress.deleteOne({ _id: tempUtpA._id });
    if (tempUtpB) await UserTaskProgress.deleteOne({ _id: tempUtpB._id });
    await DsaPamphlet.updateMany(
      {},
      { $pull: { userProgress: { userId: { $in: [userAId, userBId] } } } }
    );
  }

  const utpCountAfter = await UserTaskProgress.countDocuments({});
  console.log(`UserTaskProgress count after isolation test & cleanup: ${utpCountAfter}`);
  assert(utpCountAfter === utpCountBefore, `UserTaskProgress count is exactly preserved (${utpCountBefore} === ${utpCountAfter})`);

  // =================================================================
  // 3. MOCK-READY API SURFACE AUDIT
  // =================================================================
  console.log("\n=================================================================");
  console.log("3. MOCK-READY API SURFACE AUDIT");
  console.log("=================================================================");

  const tempMockReady = await Problem.create({
    problemCode: "TEST-MOCK-SURFACE-001",
    problemType: "Mock_Interview",
    title: "Surface Audit Isolated Mock Problem",
    slug: "surface-audit-isolated-mock-problem",
    difficulty: "Hard",
    status: "Mock_Ready",
    descriptionMarkdown: "Description for Mock surface audit",
    factoryMetadata: {
      isMockExclusive: true,
      source: "QUESTION_FACTORY"
    }
  });

  try {
    // 1. List endpoint: verify NOT present in GET /api/v1/problem/
    const resList = await fetch(`${BASE_URL}/problem/`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataList = await resList.json();
    const inList = dataList.data?.some(p => p.slug === tempMockReady.slug || p.problemCode === tempMockReady.problemCode);
    assert(!inList, "Mock_Ready problem is NOT present in student problem list");

    // 2. Search endpoint
    const resSearch = await fetch(`${BASE_URL}/problem/?search=Surface+Audit`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataSearch = await resSearch.json();
    const inSearch = dataSearch.data?.some(p => p.slug === tempMockReady.slug);
    assert(!inSearch, "Mock_Ready problem cannot be discovered via student search");

    // 3. problemType parameter filter
    const resTypeFilter = await fetch(`${BASE_URL}/problem/?problemType=Mock_Interview`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataTypeFilter = await resTypeFilter.json();
    const inType = dataTypeFilter.data?.some(p => p.slug === tempMockReady.slug);
    assert(!inType, "Mock_Ready problem cannot be accessed via ?problemType=Mock_Interview");

    // 4. status parameter filter
    const resStatusFilter = await fetch(`${BASE_URL}/problem/?status=Mock_Ready`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataStatusFilter = await resStatusFilter.json();
    const inStatus = dataStatusFilter.data?.some(p => p.slug === tempMockReady.slug);
    assert(!inStatus, "Mock_Ready problem cannot be accessed via ?status=Mock_Ready");

    // 5. Lookup by Slug
    const resBySlug = await fetch(`${BASE_URL}/problem/${tempMockReady.slug}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(resBySlug.status === 404, "Student lookup by slug returns 404 Not Found");

    // 6. Lookup by ProblemCode
    const resByCode = await fetch(`${BASE_URL}/problem/${tempMockReady.problemCode}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(resByCode.status === 404, "Student lookup by problemCode returns 404 Not Found");

    // 7. Lookup by ObjectId
    const resById = await fetch(`${BASE_URL}/problem/${tempMockReady._id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(resById.status === 404, "Student lookup by MongoDB _id returns 404 Not Found");

    // 8. Question Factory endpoint guard
    const resFactoryDrafts = await fetch(`${BASE_URL}/question-factory/drafts`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(resFactoryDrafts.status === 403, "Student access to Question Factory drafts is 403 Forbidden");

    // 9. Admin inspection can view it
    const resAdminView = await fetch(`${BASE_URL}/problem/${tempMockReady.slug}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(resAdminView.status === 200, "Admin inspection endpoint can retrieve Mock_Ready problem (200 OK)");
  } finally {
    await Problem.deleteOne({ _id: tempMockReady._id });
  }

  // =================================================================
  // 4. HIDDEN TEST END-TO-END CHECK
  // =================================================================
  console.log("\n=================================================================");
  console.log("4. HIDDEN TEST END-TO-END CHECK");
  console.log("=================================================================");

  // 1. Student GET published problem
  const resStudentProb = await fetch(`${BASE_URL}/problem/two-sum`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const dataStudentProb = await resStudentProb.json();
  assert(resStudentProb.status === 200, "Student fetches published problem successfully (200 OK)");
  assert(dataStudentProb.data?.hiddenTestCases === undefined, "Student payload response contains NO hiddenTestCases");
  assert(Array.isArray(dataStudentProb.data?.visibleTestCases) && dataStudentProb.data.visibleTestCases.length > 0, "Student payload contains visible test cases");

  // 2. Admin GET problem without explicit includeHidden
  const resAdminProbNoHidden = await fetch(`${BASE_URL}/problem/two-sum`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const dataAdminProbNoHidden = await resAdminProbNoHidden.json();
  assert(resAdminProbNoHidden.status === 200, "Admin fetches problem without includeHidden successfully");
  assert(dataAdminProbNoHidden.data?.hiddenTestCases === undefined, "Admin payload without includeHidden contains NO hiddenTestCases");

  // 3. Admin GET problem with includeHidden=true
  const resAdminProbWithHidden = await fetch(`${BASE_URL}/problem/two-sum?includeHidden=true`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const dataAdminProbWithHidden = await resAdminProbWithHidden.json();
  assert(resAdminProbWithHidden.status === 200, "Admin fetches problem with includeHidden=true successfully");
  assert(Array.isArray(dataAdminProbWithHidden.data?.hiddenTestCases) && dataAdminProbWithHidden.data.hiddenTestCases.length > 0, "Admin explicitly receives hiddenTestCases");

  // 4. Judge: Submit code to verify hidden tests are evaluated server-side
  const judgeSubmitRes = await fetch(`${BASE_URL}/judge/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      problemId: "two-sum",
      language: "javascript",
      code: `function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) return [map.get(complement), i];
          map.set(nums[i], i);
        }
        return [];
      }`
    })
  });
  const judgeSubmitData = await judgeSubmitRes.json();
  assert(judgeSubmitRes.status === 200, "Judge submit returns HTTP 200");
  assert(judgeSubmitData.data?.verdict === "ACCEPTED", "Judge evaluates code and yields ACCEPTED verdict");
  assert(judgeSubmitData.data?.passedTestCases === 4, `All 4 hidden test cases evaluated server-side (passed: ${judgeSubmitData.data?.passedTestCases}/4)`);
  assert(judgeSubmitData.data?.hiddenTestCases === undefined, "Judge response payload does NOT expose hidden test cases to browser");

  // =================================================================
  // 5. FACTORY APPROVAL ISOLATION
  // =================================================================
  console.log("\n=================================================================");
  console.log("5. FACTORY APPROVAL ISOLATION");
  console.log("=================================================================");

  const taskCountBeforeApproval = await Task.countDocuments({});
  const revisionCountBeforeApproval = await DailyRevision.countDocuments({});
  const companyCountBeforeApproval = await Company.countDocuments({});

  const tempFactoryDraft = await Problem.create({
    problemCode: "DRAFT-TEST-ISOLATION-001",
    problemType: "DSA",
    title: "Factory Approval Isolation Verification Problem",
    slug: "factory-approval-isolation-verification-problem",
    difficulty: "Medium",
    status: "Draft",
    descriptionMarkdown: "Description for factory approval isolation test",
    functionDefinition: {
      functionName: "solveIso",
      parameters: [{ name: "arr", type: "number[]" }],
      returnType: "number"
    },
    executionProfile: {
      runtimeType: "FUNCTION",
      outputSerializer: "PrimitiveSerializer",
      comparator: "ExactMatch"
    },
    referenceSolution: {
      language: "python",
      code: "def solveIso(arr):\n    return len(arr)"
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

  let approvedRecord = null;
  try {
    approvedRecord = await questionFactoryService.approveDraft(tempFactoryDraft._id.toString(), {
      reviewedBy: adminUser._id,
      adminNotes: "Pre-Mock hardening isolation approval check"
    });

    assert(approvedRecord.status === "Mock_Ready", "Approved Factory problem status set to 'Mock_Ready'");
    assert(approvedRecord.problemType === "Mock_Interview", "Approved Factory problem problemType set to 'Mock_Interview'");
    assert(approvedRecord.factoryMetadata?.isMockExclusive === true, "Approved Factory problem marked isMockExclusive=true");
    assert(/^MOCK-\d{3,}$/.test(approvedRecord.problemCode), `Approved Factory problem receives MOCK-xxx problemCode: ${approvedRecord.problemCode}`);
    assert(!approvedRecord.problemCode.startsWith("DSA-"), "Approved Factory problem DOES NOT consume DSA-xxx namespace");

    // Verify not visible to student
    const resStudentViewApproved = await fetch(`${BASE_URL}/problem/${approvedRecord.slug}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(resStudentViewApproved.status === 404, "Approved Mock problem is NOT accessible via student problem API (404)");

    // Verify visible to Admin inspection
    const resAdminViewApproved = await fetch(`${BASE_URL}/problem/${approvedRecord.slug}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(resAdminViewApproved.status === 200, "Approved Mock problem is accessible via Admin inspection (200)");

    // Verify side-effect isolation
    const taskCountAfterApproval = await Task.countDocuments({});
    const revisionCountAfterApproval = await DailyRevision.countDocuments({});
    const companyCountAfterApproval = await Company.countDocuments({});

    assert(taskCountAfterApproval === taskCountBeforeApproval, "Zero Arena Task records created during Factory approval");
    assert(revisionCountAfterApproval === revisionCountBeforeApproval, "Zero DailyRevision records created during Factory approval");
    assert(companyCountAfterApproval === companyCountBeforeApproval, "Zero Company records created during Factory approval");
  } finally {
    await Problem.deleteOne({ _id: tempFactoryDraft._id });
  }

  // =================================================================
  // 6. FINAL DATABASE SAFETY & INTEGRITY
  // =================================================================
  console.log("\n=================================================================");
  console.log("6. FINAL DATABASE SAFETY & INTEGRITY");
  console.log("=================================================================");

  const postVerification = {
    totalProblems: await Problem.countDocuments({}),
    publishedProblems: await Problem.countDocuments({ status: "Published" }),
    draftProblems: await Problem.countDocuments({ status: "Draft" }),
    reviewProblems: await Problem.countDocuments({ status: "Review" }),
    archivedProblems: await Problem.countDocuments({ status: "Archived" }),
    tasks: await Task.countDocuments({}),
    projects: await Project.countDocuments({}),
    companies: await Company.countDocuments({}),
    dailyRevisions: await DailyRevision.countDocuments({}),
    userTaskProgress: await UserTaskProgress.countDocuments({})
  };

  console.log("=== POST-VERIFICATION DATABASE RECORD COUNTS ===");
  console.log(`Problems: ${postVerification.totalProblems} (Baseline: ${baseline.totalProblems})`);
  console.log(`Published Problems: ${postVerification.publishedProblems} (Baseline: ${baseline.publishedProblems})`);
  console.log(`Draft Problems: ${postVerification.draftProblems} (Baseline: ${baseline.draftProblems})`);
  console.log(`Review Problems: ${postVerification.reviewProblems} (Baseline: ${baseline.reviewProblems})`);
  console.log(`Tasks: ${postVerification.tasks} (Baseline: ${baseline.tasks})`);
  console.log(`Projects: ${postVerification.projects} (Baseline: ${baseline.projects})`);
  console.log(`Companies: ${postVerification.companies} (Baseline: ${baseline.companies})`);
  console.log(`DailyRevision: ${postVerification.dailyRevisions} (Baseline: ${baseline.dailyRevisions})`);
  console.log(`UserTaskProgress: ${postVerification.userTaskProgress} (Baseline: ${baseline.userTaskProgress})\n`);

  assert(postVerification.totalProblems === baseline.totalProblems, `Total problems count perfectly preserved (${baseline.totalProblems})`);
  assert(postVerification.publishedProblems === baseline.publishedProblems, `Published problems count perfectly preserved (${baseline.publishedProblems})`);
  assert(postVerification.draftProblems === baseline.draftProblems, `Draft problems count perfectly preserved (${baseline.draftProblems})`);
  assert(postVerification.reviewProblems === baseline.reviewProblems, `Review problems count perfectly preserved (${baseline.reviewProblems})`);
  assert(postVerification.tasks === baseline.tasks, `Tasks count perfectly preserved (${baseline.tasks})`);
  assert(postVerification.projects === baseline.projects, `Projects count perfectly preserved (${baseline.projects})`);
  assert(postVerification.companies === baseline.companies, `Companies count perfectly preserved (${baseline.companies})`);
  assert(postVerification.dailyRevisions === baseline.dailyRevisions, `DailyRevision count perfectly preserved (${baseline.dailyRevisions})`);
  assert(postVerification.userTaskProgress === baseline.userTaskProgress, `UserTaskProgress count perfectly preserved (${baseline.userTaskProgress})`);

  // Verify DSA-001..DSA-017 integrity
  const publishedDsa = await Problem.find({ problemCode: /^DSA-\d+$/, status: "Published" }).sort({ problemCode: 1 });
  assert(publishedDsa.length === 16, `Exactly 16 published DSA problems exist`);
  const codes = publishedDsa.map(p => p.problemCode);
  assert(codes[0] === "DSA-001" && codes[codes.length - 1] === "DSA-017", `DSA-001 to DSA-017 verified intact`);
  assert(!codes.includes("DSA-016"), "DSA-016 sequence gap preserved");

  // Verify historical drafts
  const d138779 = await Problem.findOne({ problemCode: "DRAFT-138779" });
  assert(d138779 !== null && d138779.status === "Draft", "Historical draft DRAFT-138779 remains intact in Draft status");

  const d533477 = await Problem.findOne({ problemCode: "DRAFT-533477" });
  assert(d533477 !== null && d533477.status === "Draft", "Historical draft DRAFT-533477 remains intact in Draft status");

  console.log("\n=====================================================================");
  console.log(`FINAL VERIFICATION RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("=====================================================================\n");

  await mongoose.disconnect();

  if (failCount > 0) {
    console.error("FAILURES DETECTED:", failures);
    process.exit(1);
  }
}

runFinalVerification().catch(err => {
  console.error("Final Verification Suite Fatal Error:", err);
  process.exit(1);
});
