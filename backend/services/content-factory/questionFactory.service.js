import Problem from '../../models/problem.model.js';
import { QuestionGenerationEngine } from './generators/QuestionGenerationEngine.js';
import { ReferenceRunner } from '../judge/referenceRunner.js';
import { ProblemQualityValidator } from './validation/ProblemQualityValidator.js';
import { JudgeValidationGate } from './validation/JudgeValidationGate.js';
import { ExampleVerificationGate } from './validation/ExampleVerificationGate.js';
import { AdversarialValidationGate } from './validation/AdversarialValidationGate.js';
import { generateAllStarterTemplates } from '../../../shared/templateGenerator.js';

/**
 * CORE FACTORY PRINCIPLE (Phase 2.6):
 * "The Question Factory must evaluate whether a student's algorithm is correct
 * under the problem specification, not whether it resembles the factory's
 * reference implementation."
 */
export class QuestionFactoryService {
  constructor(engine = null) {
    this.engine = engine || new QuestionGenerationEngine();
  }

  /**
   * Generates, validates, and stores a new AI DSA draft problem.
   */
  async generateDraft({ pattern = 'Sliding Window', difficulty = 'Medium', directives = '', userId = null }) {
    console.log(`[QuestionFactory] Initiating generation: Pattern="${pattern}", Difficulty="${difficulty}"...`);

    // Pass 1: Generate Problem Specification with Pattern Learning Contract
    const problemSpec = await this.engine.generateProblemSpec({ pattern, difficulty, directives });
    console.log(`[QuestionFactory] Pass 1 complete: "${problemSpec.title}"`);

    // Ensure unique slug
    let baseSlug = problemSpec.slug || problemSpec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await Problem.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    problemSpec.slug = slug;

    // Temporary Draft Problem Code
    const draftCode = `DRAFT-${Date.now().toString().slice(-6)}`;

    // Pass 1B: Example Verification Gate (Phase 2 Hardening)
    // Real execution test of all student-facing examples against trusted reference solution
    console.log(`[QuestionFactory] Pass 1B: Verifying student-facing examples...`);
    const exampleGateRes = await ExampleVerificationGate.verify({
      problemSpec,
      referenceSolution: problemSpec.referenceSolution,
      executionProfile: problemSpec.executionProfile
    });
    if (!exampleGateRes.passed) {
      console.warn(`[QuestionFactory] Example verification failed: ${exampleGateRes.error}`);
    } else {
      console.log(`[QuestionFactory] Examples verified successfully (${exampleGateRes.exampleReports?.length} examples).`);
    }

    // Pass 2: Derive Problem-Specific Test Strategy (No prompt contamination)
    console.log(`[QuestionFactory] Pass 2: Deriving test strategy...`);
    const testStrategy = await this.engine.generateTestStrategy({ problemSpec });

    // Pass 3: Generate Validated Test Inputs (Deterministic performance cases + validated semantic cases)
    console.log(`[QuestionFactory] Pass 3: Generating test inputs with constraint audit...`);
    const { testInputs, categoryAudit, allCategoriesPassed } = await this.engine.generateValidatedTestInputs({
      problemSpec,
      testStrategy,
      maxRegenerationAttempts: 3
    });

    // Pass 4: Execute Sandboxed Reference Runner to determine canonical expected outputs
    console.log(`[QuestionFactory] Pass 4: Executing sandboxed Reference Runner for ${testInputs.length} inputs...`);
    const runnerRes = await ReferenceRunner.execute({
      language: 'python',
      referenceCode: problemSpec.referenceSolution.code,
      functionDefinition: problemSpec.functionDefinition,
      testCases: testInputs,
      executionProfile: problemSpec.executionProfile,
      timeLimitMs: 4000
    });

    if (!runnerRes.success || !runnerRes.compiledTestCases || runnerRes.compiledTestCases.length === 0) {
      throw new Error(`Reference Runner execution failed: ${runnerRes.error || 'Failed to compute expected outputs.'}`);
    }

    let compiledTestCases = runnerRes.compiledTestCases;
    console.log(`[QuestionFactory] Truth outputs computed successfully (${compiledTestCases.length} testcases).`);

    // Pass 4B: Adversarial Wrong-Solution Testing (Phase 2 Hardening)
    console.log(`[QuestionFactory] Pass 4B: Running adversarial wrong-solution tests...`);
    const adversarialGateRes = await AdversarialValidationGate.validate({
      problemSpec,
      referenceSolution: problemSpec.referenceSolution,
      testCases: compiledTestCases,
      executionLimits: problemSpec.executionLimits || { timeLimitMs: 2000, memoryLimitMb: 256 }
    });

    if (adversarialGateRes.newTargetedTests?.length > 0) {
      console.log(`[QuestionFactory] Injected ${adversarialGateRes.newTargetedTests.length} targeted adversarial test(s).`);
      compiledTestCases = adversarialGateRes.updatedTestCases || [...compiledTestCases, ...adversarialGateRes.newTargetedTests];
    }

    // Separate into visible (first 2-3) and hidden test cases while preserving category provenance
    const visibleCount = Math.min(3, Math.max(1, Math.floor(compiledTestCases.length * 0.2)));

    // Test Category Provenance Tracking
    const testProvenance = compiledTestCases.map((tc, idx) => {
      const isVisible = idx < visibleCount;
      const locIndex = isVisible ? idx : idx - visibleCount;
      const categoryId = tc.categoryId || tc.category || testInputs[idx]?.categoryId || 'evaluation';
      const isPerf = Boolean(tc.isPerformanceTest || testInputs[idx]?.isPerformanceTest);
      return {
        testIndex: idx + 1,
        location: isVisible ? `visibleTestCases[${locIndex}]` : `hiddenTestCases[${locIndex}]`,
        visibility: isVisible ? 'visible' : 'hidden',
        categoryId,
        isPerformanceTest: isPerf,
        explanation: isVisible 
          ? `Visible example test #${idx + 1} (${categoryId})`
          : `Hidden evaluation case #${locIndex + 1} (${categoryId})`
      };
    });
    testStrategy.testProvenance = testProvenance;

    // Attach exact locations to category audit
    categoryAudit.forEach(audit => {
      audit.locations = testProvenance.filter(p => p.categoryId === audit.categoryId).map(p => p.location);
    });

    const visibleTestCases = compiledTestCases.slice(0, visibleCount).map((tc, idx) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      explanation: `Visible example test #${idx + 1} (${tc.categoryId || tc.category || testInputs[idx]?.categoryId || 'edge_cases'})`,
      order: idx + 1,
      weight: 1.0,
      isActive: true
    }));

    const hiddenTestCases = compiledTestCases.slice(visibleCount).map((tc, idx) => {
      const inputIdx = idx + visibleCount;
      const categoryId = tc.categoryId || tc.category || testInputs[inputIdx]?.categoryId || 'evaluation';
      return {
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        explanation: `Hidden evaluation case #${idx + 1} (${categoryId})`,
        executionOrder: idx + 1,
        weight: 1.0,
        isActive: true,
        isPerformanceTest: Boolean(tc.isPerformanceTest || testInputs[inputIdx]?.isPerformanceTest)
      };
    });

    // Pass 5: Quality Audit with Pattern Contract Validation & Trivialization Detection
    console.log(`[QuestionFactory] Pass 5: Evaluating discrete quality signals & pattern contract...`);
    const { qualityReport, details: qualityDetails, learningObjective, difficultyReasoning } = await ProblemQualityValidator.evaluate({
      problemSpec,
      testStrategy,
      compiledTestCases,
      categoryAudit
    });

    // Pass 6: Real CoreJudgeExecutor Validation Gate
    console.log(`[QuestionFactory] Pass 6: Submitting reference solution to CoreJudgeExecutor self-test...`);
    const allFormattedCases = compiledTestCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput
    }));

    const judgeGateRes = await JudgeValidationGate.validate({
      referenceSolution: problemSpec.referenceSolution,
      functionDefinition: problemSpec.functionDefinition,
      executionProfile: problemSpec.executionProfile,
      testCases: allFormattedCases,
      executionLimits: problemSpec.executionLimits || { timeLimitMs: 2000, memoryLimitMb: 256 }
    });

    // Phase 2: Strict Validation Gate Enforcement
    const categoryAuditPassed = Boolean(allCategoriesPassed && categoryAudit.length > 0 && categoryAudit.every(c => c.actualCount >= c.targetCount));
    const perfAudit = categoryAudit.find(c => c.categoryId === 'performance_cases');
    const hasRealPerfCase = Boolean(perfAudit && perfAudit.actualCount > 0);

    const validationErrors = [];
    if (!exampleGateRes.passed) {
      validationErrors.push(`Example Verification Failed: ${exampleGateRes.error}`);
    }
    if (!adversarialGateRes.passed) {
      validationErrors.push(`Adversarial Testing Failed: ${adversarialGateRes.error}`);
    }
    if (!judgeGateRes.passed || judgeGateRes.verdict !== 'Accepted') {
      validationErrors.push(`Judge Self-Test Failed: ${judgeGateRes.error || judgeGateRes.verdict}`);
    }
    if (!categoryAuditPassed) {
      const failing = categoryAudit.filter(c => c.actualCount < c.targetCount);
      validationErrors.push(`Required test category deficit: [${failing.map(c => `${c.categoryId}: ${c.actualCount}/${c.targetCount}`).join(', ')}]`);
    }
    if (!hasRealPerfCase) {
      validationErrors.push("Zero executable performance test cases generated.");
    }
    if (qualityReport.patternAlignment === 'FAIL') {
      validationErrors.push("Pattern Alignment Failure: Problem fails the algorithmic learning contract or is trivialized.");
    }
    if (qualityReport.clarity === 'FAIL') {
      validationErrors.push("Clarity Failure: Problem description is insufficient.");
    }
    if (qualityReport.constraintComplexity === 'FAIL') {
      validationErrors.push("Constraint Failure: Problem specifies zero constraints.");
    }
    if (qualityReport.testCoverage === 'FAIL') {
      validationErrors.push("Test Coverage Failure: Incomplete test suite.");
    }
    if (qualityReport.exampleQuality === 'FAIL') {
      validationErrors.push("Example Quality Failure: Missing examples.");
    }

    const isValid = validationErrors.length === 0;
    const validationState = isValid ? 'VALIDATED' : 'FAILED';
    const problemStatus = isValid ? 'Review' : 'Draft';

    const perfCaseItem = (testInputs || []).find(t => t.isPerformanceTest);
    const validationReport = {
      validationState,
      isValidated: isValid,
      validatedAt: new Date(),
      structuralValidationPassed: true,
      constraintAuditPassed: categoryAuditPassed,
      exampleVerificationPassed: exampleGateRes.passed,
      adversarialTestingPassed: adversarialGateRes.passed,
      judgeSelfTestPassed: judgeGateRes.passed && judgeGateRes.verdict === 'Accepted',
      judgeVerdict: judgeGateRes.verdict || 'NONE',
      judgeExecutionTimeMs: judgeGateRes.executionTimeMs || 0,
      performanceStatus: hasRealPerfCase ? (judgeGateRes.performanceStatus || `Reference solution validated at N = ${perfCaseItem?.scaleN || 50000}`) : 'UNTESTED',
      performanceWarningDetails: judgeGateRes.performanceWarningDetails || (hasRealPerfCase ? '' : 'No performance cases executed'),
      performanceProfile: perfCaseItem?.performanceProfile || {
        targetComplexity: 'O(N)',
        validatedScaleN: perfCaseItem?.scaleN || (hasRealPerfCase ? 30000 : 0),
        adversarialTopology: perfCaseItem?.topology || 'Standard'
      },
      exampleVerification: exampleGateRes,
      adversarialReport: adversarialGateRes,
      qualityReport,
      validationErrors: [...validationErrors, ...qualityDetails],
      regenerationAttempts: categoryAudit.reduce((acc, c) => acc + (c.attemptsNeeded - 1), 0)
    };

    // Update test category actual counts
    const updatedCategories = (testStrategy.categories || []).map(cat => {
      const audit = categoryAudit.find(a => a.categoryId === cat.categoryId);
      return {
        ...cat,
        actualCount: audit ? audit.actualCount : 0
      };
    });
    testStrategy.categories = updatedCategories;

    // Assemble and persist Problem
    // Ensure starterCode is derived deterministically from canonical functionDefinition
    let compiledStarterCode = problemSpec.starterCode;
    if (!Array.isArray(compiledStarterCode) || compiledStarterCode.length === 0) {
      const templates = generateAllStarterTemplates(problemSpec.functionDefinition, problemSpec.executionProfile);
      compiledStarterCode = Object.entries(templates).map(([lang, code]) => ({
        language: lang,
        code,
        defaultTemplate: code
      }));
    }

    const draftDoc = await Problem.create({
      problemCode: draftCode,
      problemType: 'DSA',
      title: problemSpec.title,
      slug: problemSpec.slug,
      difficulty: problemSpec.difficulty,
      status: problemStatus,
      descriptionMarkdown: problemSpec.descriptionMarkdown,
      examples: problemSpec.examples || [],
      constraints: problemSpec.constraints || [],
      hints: problemSpec.hints || [],
      functionDefinition: problemSpec.functionDefinition,
      executionProfile: problemSpec.executionProfile,
      starterCode: compiledStarterCode,
      visibleTestCases,
      hiddenTestCases,
      editorialMarkdown: problemSpec.editorialMarkdown || problemSpec.intendedAlgorithm || '',
      referenceSolution: problemSpec.referenceSolution,
      factoryMetadata: {
        source: 'QUESTION_FACTORY',
        generationType: 'AI_PIPELINE',
        generatedByAI: true,
        aiProvider: 'groq',
        aiModel: process.env.AI_FACTORY_MODEL || 'openai/gpt-oss-120b',
        promptVersion: 'v2.0.0',
        generationDirectives: directives || '',
        testStrategy,
        validationReport,
        learningObjective,
        difficultyReasoning
      },
      createdBy: userId
    });

    console.log(`[QuestionFactory] Draft saved successfully: [${draftDoc.problemCode}] "${draftDoc.title}" (Status: ${draftDoc.status}, Validation: ${validationState})`);
    return draftDoc;
  }

  /**
   * Retrieves paginated drafts for the Admin Review queue.
   */
  async getDrafts({ page = 1, limit = 20, status, difficulty }) {
    const query = {
      $or: [
        { 'factoryMetadata.source': 'QUESTION_FACTORY' },
        { 'factoryMetadata.validationReport': { $exists: true } }
      ]
    };
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;

    const skip = (Number(page) - 1) * Number(limit);
    const [drafts, total] = await Promise.all([
      Problem.find(query)
        .select('+referenceSolution +hiddenTestCases')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Problem.countDocuments(query)
    ]);

    return {
      drafts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  /**
   * Retrieves single draft by ID with complete metadata and reference solution.
   */
  async getDraftById(id) {
    const draft = await Problem.findById(id).select('+referenceSolution +hiddenTestCases');
    if (!draft) {
      throw new Error(`Draft problem not found for id: ${id}`);
    }
    return draft;
  }

  /**
   * Re-runs the complete validation pipeline on an existing draft.
   */
  async revalidateDraft(id) {
    const draft = await Problem.findById(id).select('+referenceSolution +hiddenTestCases');
    if (!draft) {
      throw new Error(`Draft problem not found for id: ${id}`);
    }

    const allTestCases = [
      ...(draft.visibleTestCases || []),
      ...(draft.hiddenTestCases || [])
    ];

    const strategyCategories = draft.factoryMetadata?.testStrategy?.categories || [];
    const hasPerfTest = allTestCases.some(tc => tc.isPerformanceTest);

    const { qualityReport, details: qualityDetails, learningObjective, difficultyReasoning } = await ProblemQualityValidator.evaluate({
      problemSpec: draft,
      testStrategy: draft.factoryMetadata?.testStrategy,
      compiledTestCases: allTestCases,
      categoryAudit: strategyCategories
    });

    const judgeGateRes = await JudgeValidationGate.validate({
      referenceSolution: draft.referenceSolution,
      functionDefinition: draft.functionDefinition,
      executionProfile: draft.executionProfile,
      testCases: allTestCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
      executionLimits: draft.executionLimits
    });

    const validationErrors = [];
    if (!judgeGateRes.passed || judgeGateRes.verdict !== 'Accepted') {
      validationErrors.push(`Judge Self-Test Failed: ${judgeGateRes.error || judgeGateRes.verdict}`);
    }
    if (!hasPerfTest) {
      validationErrors.push("Zero executable performance test cases present.");
    }
    if (qualityReport.patternAlignment === 'FAIL') {
      validationErrors.push("Pattern Alignment Failure: Algorithmic contract violated.");
    }
    if (qualityReport.clarity === 'FAIL') {
      validationErrors.push("Clarity Failure.");
    }
    if (qualityReport.testCoverage === 'FAIL') {
      validationErrors.push("Test Coverage Failure.");
    }

    const isValid = validationErrors.length === 0;
    const validationState = isValid ? 'VALIDATED' : 'FAILED';
    const status = isValid ? 'Review' : 'Draft';

    draft.status = status;
    draft.factoryMetadata.validationReport.validationState = validationState;
    draft.factoryMetadata.validationReport.isValidated = isValid;
    draft.factoryMetadata.validationReport.validatedAt = new Date();
    draft.factoryMetadata.validationReport.judgeSelfTestPassed = judgeGateRes.passed && judgeGateRes.verdict === 'Accepted';
    draft.factoryMetadata.validationReport.judgeVerdict = judgeGateRes.verdict;
    draft.factoryMetadata.validationReport.judgeExecutionTimeMs = judgeGateRes.executionTimeMs;
    draft.factoryMetadata.validationReport.performanceStatus = hasPerfTest ? (judgeGateRes.performanceStatus || 'OPTIMAL') : 'UNTESTED';
    draft.factoryMetadata.validationReport.performanceWarningDetails = judgeGateRes.performanceWarningDetails || '';
    draft.factoryMetadata.validationReport.qualityReport = qualityReport;
    draft.factoryMetadata.validationReport.validationErrors = [...validationErrors, ...qualityDetails];
    if (learningObjective) draft.factoryMetadata.learningObjective = learningObjective;
    if (difficultyReasoning) draft.factoryMetadata.difficultyReasoning = difficultyReasoning;

    await draft.save();
    return draft;
  }

  /**
   * Approves and publishes a validated draft into the official Sarthi Question Bank.
   */
  async approveDraft(id, { reviewedBy, adminNotes = '' }) {
    const draft = await Problem.findById(id).select('+referenceSolution +hiddenTestCases');
    if (!draft) {
      throw new Error(`Draft problem not found for id: ${id}`);
    }

    const report = draft.factoryMetadata?.validationReport;
    if (
      !report ||
      report.validationState !== 'VALIDATED' ||
      !report.isValidated ||
      !report.judgeSelfTestPassed ||
      !report.constraintAuditPassed ||
      report.performanceStatus === 'UNTESTED' ||
      report.performanceStatus === 'TIMEOUT'
    ) {
      throw new Error("Cannot approve draft: Problem has not passed all required Judge, performance, and constraint validations.");
    }

    // Collision-proof MOCK problemCode generation by finding maximum existing code
    const existingCodes = await Problem.find({ problemCode: /^MOCK-\d+$/ })
      .select('problemCode')
      .lean();

    let maxNum = 0;
    for (const p of existingCodes) {
      const match = p.problemCode.match(/^MOCK-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    let nextNum = maxNum + 1;
    let officialProblemCode = `MOCK-${String(nextNum).padStart(3, '0')}`;
    while (await Problem.exists({ problemCode: officialProblemCode })) {
      nextNum++;
      officialProblemCode = `MOCK-${String(nextNum).padStart(3, '0')}`;
    }

    draft.problemCode = officialProblemCode;
    draft.problemType = 'Mock_Interview';
    draft.status = 'Mock_Ready';
    if (!draft.factoryMetadata) {
      draft.factoryMetadata = {};
    }
    draft.factoryMetadata.isMockExclusive = true;
    draft.factoryMetadata.reviewInfo = {
      reviewedBy,
      reviewedAt: new Date(),
      adminNotes
    };

    await draft.save();
    console.log(`[QuestionFactory] Problem approved for Mock: ${officialProblemCode} - "${draft.title}"`);
    return draft;
  }

  /**
   * Rejects an unsatisfactory draft and marks it Archived.
   */
  async rejectDraft(id, { reviewedBy, reason = '' }) {
    const draft = await Problem.findById(id);
    if (!draft) {
      throw new Error(`Draft problem not found for id: ${id}`);
    }

    draft.status = 'Archived';
    draft.factoryMetadata.reviewInfo = {
      reviewedBy,
      reviewedAt: new Date(),
      adminNotes: `REJECTED: ${reason}`
    };

    await draft.save();
    return draft;
  }
}

export const questionFactoryService = new QuestionFactoryService();
