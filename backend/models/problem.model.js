import mongoose, { Schema } from "mongoose";

const exampleSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: "" },
  order: { type: Number, default: 1 }
}, { _id: false });

const parameterSchema = new Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true }, // number, string, boolean, number[], string[], boolean[], number[][], string[][], ListNode, RandomListNode, TreeNode, Graph
  required: { type: Boolean, default: true },
  nullable: { type: Boolean, default: false },
  description: { type: String, default: "" }
}, { _id: false });

const functionDefinitionSchema = new Schema({
  functionName: { type: String, default: "solution", trim: true },
  parameters: [parameterSchema],
  returnType: { type: String, default: "void", trim: true }
}, { _id: false });

const executionProfileSchema = new Schema({
  runtimeType: { 
    type: String, 
    enum: ['FUNCTION'], 
    default: 'FUNCTION' 
  },
  outputSerializer: { 
    type: String, 
    trim: true,
    default: 'PrimitiveSerializer' 
  },
  comparator: { 
    type: String, 
    trim: true,
    default: 'ExactMatch' 
  },
  customType: {
    type: String,
    trim: true,
    default: ''
  },
  inPlaceMutation: {
    type: Boolean,
    default: false
  },
  mutatedParameter: {
    type: String,
    trim: true,
    default: ''
  },
  semanticValidator: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const languageRuntimeSchema = new Schema({
  language: { type: String, required: true },
  runtime: {
    version: { type: String, default: "" },
    compiler: { type: String, default: "" },
    entryPoint: { type: String, default: "Solution" },
    boilerplateOverride: { type: String, default: "" }
  }
}, { _id: false });

const starterCodeSchema = new Schema({
  language: { type: String, required: true }, // e.g. "python", "javascript", "cpp", "java"
  code: { type: String, default: "" },
  functionSignature: { type: String, default: "" },
  defaultTemplate: { type: String, default: "" }
}, { _id: false });

const visibleTestCaseSchema = new Schema({
  input: { type: Schema.Types.Mixed, required: true }, // Structured JSON object or primitive
  expectedOutput: { type: Schema.Types.Mixed, required: true },
  explanation: { type: String, default: "" },
  order: { type: Number, default: 1 },
  weight: { type: Number, default: 1.0 },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const hiddenTestCaseSchema = new Schema({
  input: { type: Schema.Types.Mixed, required: true },
  expectedOutput: { type: Schema.Types.Mixed, required: true },
  explanation: { type: String, default: "" },
  weight: { type: Number, default: 1.0 },
  executionOrder: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  isPerformanceTest: { type: Boolean, default: false }
}, { _id: false });

// Question Factory Reference Solution (Hidden from student-facing APIs)
const referenceSolutionSchema = new Schema({
  language: { type: String, default: "python", trim: true },
  code: { type: String, required: true },
  timeComplexity: { type: String, default: "", trim: true },
  spaceComplexity: { type: String, default: "", trim: true }
}, { _id: false });

// Question Factory Metadata Schemas
const testCategorySchema = new Schema({
  categoryId: { type: String, required: true },
  description: { type: String, default: "" },
  targetCount: { type: Number, default: 0 },
  actualCount: { type: Number, default: 0 }
}, { _id: false });

const testStrategySchema = new Schema({
  summary: { type: String, default: "" },
  intendedAlgorithm: { type: String, default: "" },
  targetedMistakes: [{ type: String }],
  categories: [testCategorySchema],
  testProvenance: [{ type: Schema.Types.Mixed }]
}, { _id: false, strict: false });

const qualityReportSchema = new Schema({
  clarity: { type: String, enum: ['PASS', 'WARNING', 'FAIL', 'SKIPPED'], default: 'PASS' },
  patternAlignment: { type: String, enum: ['PASS', 'WARNING', 'FAIL', 'SKIPPED'], default: 'PASS' },
  difficultyCalibration: { type: String, enum: ['PASS', 'WARNING', 'FAIL', 'SKIPPED'], default: 'PASS' },
  constraintComplexity: { type: String, enum: ['PASS', 'WARNING', 'FAIL', 'SKIPPED'], default: 'PASS' },
  exampleQuality: { type: String, enum: ['PASS', 'WARNING', 'FAIL', 'SKIPPED'], default: 'PASS' },
  testCoverage: { type: String, enum: ['PASS', 'WARNING', 'FAIL', 'SKIPPED'], default: 'PASS' },
  similarity: { type: String, enum: ['PASS', 'WARNING', 'FAIL', 'SKIPPED'], default: 'PASS' },
  similarityScore: { type: Number, default: 0 },
  similarityDetails: { type: String, default: "" }
}, { _id: false });

const validationReportSchema = new Schema({
  validationState: { 
    type: String, 
    enum: ['PENDING', 'VALIDATING', 'VALIDATED', 'FAILED'], 
    default: 'PENDING' 
  },
  isValidated: { type: Boolean, default: false },
  validatedAt: { type: Date, default: null },

  structuralValidationPassed: { type: Boolean, default: false },
  constraintAuditPassed: { type: Boolean, default: false },
  exampleVerificationPassed: { type: Boolean, default: false },
  adversarialTestingPassed: { type: Boolean, default: false },

  judgeSelfTestPassed: { type: Boolean, default: false },
  judgeVerdict: { type: String, default: "" },
  judgeExecutionTimeMs: { type: Number, default: 0 },

  performanceStatus: { 
    type: String, 
    enum: ['OPTIMAL', 'ACCEPTABLE', 'WARNING', 'UNTESTED'], 
    default: 'UNTESTED' 
  },
  performanceWarningDetails: { type: String, default: "" },
  performanceProfile: { type: Schema.Types.Mixed, default: () => ({}) },

  exampleVerification: { type: Schema.Types.Mixed, default: () => ({}) },
  adversarialReport: { type: Schema.Types.Mixed, default: () => ({}) },

  qualityReport: { type: qualityReportSchema, default: () => ({}) },

  validationErrors: [{ type: String }],
  regenerationAttempts: { type: Number, default: 0 }
}, { _id: false, strict: false });

const reviewInfoSchema = new Schema({
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  adminNotes: { type: String, default: "" }
}, { _id: false });

const learningObjectiveSchema = new Schema({
  pattern: { type: String, default: "" },
  coreSkill: { type: String, default: "" },
  recognitionSignal: { type: String, default: "" },
  requiredInvariant: { type: String, default: "" },
  expectedComplexity: { type: String, default: "" },
  commonWrongApproaches: [{ type: String }],
  difficultyReason: { type: String, default: "" },
  testObjectives: [{ type: String }]
}, { _id: false });

const factoryMetadataSchema = new Schema({
  source: { 
    type: String, 
    enum: ['QUESTION_FACTORY', 'MANUAL', 'EXTERNAL'], 
    default: 'QUESTION_FACTORY' 
  },
  generationType: { 
    type: String, 
    enum: ['AI_PIPELINE', 'CONTROLLED_EXPERIMENT', 'MANUAL_AUTHORING'], 
    default: 'AI_PIPELINE' 
  },
  generatedByAI: { type: Boolean, default: false },
  aiProvider: { type: String, default: "" },
  aiModel: { type: String, default: "" },
  promptVersion: { type: String, default: "v2.0.0" },
  generationDirectives: { type: String, default: "" },
  testStrategy: { type: testStrategySchema, default: () => ({}) },
  validationReport: { type: validationReportSchema, default: () => ({}) },
  reviewInfo: { type: reviewInfoSchema, default: () => ({}) },
  learningObjective: { type: learningObjectiveSchema, default: () => ({}) },
  difficultyReasoning: { type: String, default: "" },
  isMockExclusive: { type: Boolean, default: false }
}, { _id: false });

const problemSchema = new Schema(
  {
    problemCode: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true, 
      trim: true 
    },
    problemType: { 
      type: String, 
      enum: ['DSA', 'SQL', 'Frontend_JS', 'System_Design', 'Aptitude', 'Mock_Interview'], 
      default: 'DSA' 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true, 
      lowercase: true, 
      trim: true 
    },
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Medium', 'Hard'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['Draft', 'Review', 'Approved', 'Mock_Ready', 'Published', 'Archived'], 
      default: 'Draft',
      index: true 
    },
    companies: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Company' 
    }],
    topics: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Topic' 
    }],
    pattern: { 
      type: Schema.Types.ObjectId, 
      ref: 'Pattern' 
    },
    descriptionMarkdown: { 
      type: String, 
      required: true 
    },
    examples: [exampleSchema],
    constraints: [{ 
      type: String 
    }],
    hints: [{ 
      type: String 
    }],
    
    // Universal Execution Engine Schema Fields
    functionDefinition: {
      type: functionDefinitionSchema,
      default: () => ({ functionName: "twoSum", parameters: [], returnType: "void" })
    },
    executionProfile: {
      type: executionProfileSchema,
      default: () => ({ runtimeType: "FUNCTION", outputSerializer: "PrimitiveSerializer", comparator: "ExactMatch", customType: "", inPlaceMutation: false, mutatedParameter: "" })
    },
    languageRuntimes: [languageRuntimeSchema],

    starterCode: [starterCodeSchema],
    visibleTestCases: [visibleTestCaseSchema],
    hiddenTestCases: {
      type: [hiddenTestCaseSchema],
      select: false
    },
    executionLimits: {
      timeLimitMs: { type: Number, default: 2000 },
      memoryLimitMb: { type: Number, default: 256 }
    },
    editorialMarkdown: { 
      type: String, 
      default: "" 
    },
    metadata: {
      estimatedSolveTime: { type: Number, default: 20 },
      xpReward: { type: Number, default: 50 },
      revisionWeight: { type: Number, default: 1 },
      interviewFrequency: { type: String, default: "Medium" },
      featuredProblem: { type: Boolean, default: false },
      contestProblem: { type: Boolean, default: false },
      learningObjective: { type: String, default: "" },
      prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
      recommendedNextProblems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }]
    },
    statistics: {
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 }
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    packageVersion: {
      type: String,
      default: 'v1.0.0'
    },
    packageHash: {
      type: String,
      default: ''
    },
    // Question Factory Extensions
    referenceSolution: {
      type: referenceSolutionSchema,
      select: false // Never exposed in student queries by default
    },
    factoryMetadata: {
      type: factoryMetadataSchema,
      default: () => ({})
    }
  },
  { timestamps: true }
);

// Compound Index for student listing queries
problemSchema.index({ status: 1, difficulty: 1 });
problemSchema.index({ status: 1, problemType: 1 });

const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);
export default Problem;
