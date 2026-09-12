import mongoose, { Schema } from "mongoose";

const activityLogSchema = new Schema(
  {
    oldStatus: { type: String, default: null },
    currentStatus: { type: String, required: true },
    date: { type: Date, default: Date.now },
    message: { type: String, default: "" }
  },
  { _id: false }
);

const revisionLogSchema = new Schema(
  {
    revisionDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" }
  },
  { _id: false }
);

const solveAttemptSchema = new Schema(
  {
    attemptedAt: { type: Date, default: Date.now },
    durationMinutes: { type: Number, default: 0 },
    outcome: {
      type: String,
      enum: [
        "SOLVED_INDEPENDENT",
        "SOLVED_WITH_HINTS",
        "SOLVED_WITH_SOLUTION",
        "UNSOLVED"
      ],
      required: true
    },
    confidence: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true
    },
    notes: { type: String, default: "" },
    focusSessionId: {
      type: Schema.Types.ObjectId,
      ref: "FocusSession",
      default: null
    }
  },
  { _id: true }
);

const userTaskProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true
    },
    projectName: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      index: true
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      index: true
    },
    status: {
      type: String,
      enum: ["todo", "inprogress", "review", "done", "hold", "backlog"],
      default: "todo",
      index: true
    },
    taskStartDate: {
      type: Date,
      default: null
    },
    taskDueDate: {
      type: Date,
      default: null
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    holdDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    latestOutcome: {
      type: String,
      enum: [
        "SOLVED_INDEPENDENT",
        "SOLVED_WITH_HINTS",
        "SOLVED_WITH_SOLUTION",
        "UNSOLVED",
        null
      ],
      default: null
    },
    latestConfidence: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", null],
      default: null
    },
    activityLogs: [activityLogSchema],
    revisionLogs: [revisionLogSchema],
    solveHistory: [solveAttemptSchema],
    lldSubmissions: [
      {
        language: { type: String, required: true },
        code: { type: String, required: true },
        status: { type: String, required: true },
        executionTimeMs: { type: Number, default: 0 },
        stdout: { type: String, default: "" },
        stderr: { type: String, default: "" },
        submittedAt: { type: Date, default: Date.now }
      }
    ],
    lastSubmittedCode: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound Unique Index: One progress/execution record per user per task
userTaskProgressSchema.index({ userId: 1, taskId: 1 }, { unique: true });

// Compound Indexes for fast user queries in Arenas and Modules
userTaskProgressSchema.index({ userId: 1, projectName: 1, status: 1 });
userTaskProgressSchema.index({ userId: 1, branchId: 1, status: 1 });

export const UserTaskProgress = mongoose.model("UserTaskProgress", userTaskProgressSchema);
