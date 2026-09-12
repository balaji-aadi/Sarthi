import mongoose, { Schema } from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    projectName: { 
      type: Schema.Types.ObjectId, 
      ref: "Project", 
      required: false // Changed from true to false to allow personal tasks
    },
    taskName: { 
      type: String, 
      required: true 
    },
    taskId: {
      type: String,
      unique: true,
      sparse: true
    },
    taskPriority: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      required: true 
    },
    taskType: { 
      type: String, 
      required: true 
    },
    taskStartDate: {
      type: Date,
      required: false
    },
    taskDueDate: {
      type: Date,
      required: false
    },
    estimatedHours: { 
      type: Number 
    },
    backlogEstimatedHours: {
      type: Number,
      default: 0
    },
    storyPoints: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      default: 0
    },
    epic: {
      type: Schema.Types.ObjectId,
      ref: "Epic"
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint"
    },
    taskDescription: { 
      type: String 
    },
    additionalNotes: {
      type: String
    },
    youtubeUrl: {
      type: String,
      required: false
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", null],
      default: null,
      index: true
    },
    leetcodeUrl: {
      type: String,
      default: "",
      trim: true
    },
    isUrlVerified: {
      type: Boolean,
      default: false
    },
    patternRef: {
      type: Schema.Types.ObjectId,
      ref: "Pattern",
      default: null,
      index: true
    },
    companyTags: [
      {
        company: {
          type: Schema.Types.ObjectId,
          ref: "Company",
          required: true
        }
      }
    ],
    attachments: [{ 
      type: String 
    }],
    milestone: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
      default: null
    },
    // Hierarchy
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true
    },
    dependentTasks: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Task" 
    }],
    
    // Performance Indexes (defined below, but fields here)
    assignee: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      default: null,
      index: true 
    },
    status: { 
      type: String, 
      enum: ["todo", "inprogress", "review", "done", "hold", "backlog"],
      default: "todo",
      index: true
    },
    holdDate: {
      type: Date,
      default: null
    },
    
    // Computed Subs Stats (for optimization)
    subtaskStats: {
        total: { type: Number, default: 0 },
        completed: { type: Number, default: 0 }
    },

    updatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    activityLogs: [
      {
        oldStatus: { type: String, default: "" },
        currentStatus: { type: String, default: "" },
        user: { 
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null 
        },
        date: { type: Date, default: Date.now },
        message: { type: String, default: "" }
      }
    ],
    revisionLogs: [
      {
        revisionDate: { type: Date, default: Date.now },
        notes: { type: String, default: "" },
        revisedBy: { 
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null 
        }
      }
    ],
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      index: true
    },
    // Structured Curriculum Metadata (LLD & Advanced Curricula)
    curriculumMeta: {
      nodeType: { 
        type: String, 
        enum: ["module", "unit", "drill", "major_problem", "problem_version", null], 
        default: null 
      },
      level: { 
        type: String, 
        enum: ["A", "B", "C", null], 
        default: null 
      },
      levelName: { 
        type: String, 
        default: "" 
      },
      actionVerb: { 
        type: String, 
        enum: ["BUILD", "REFACTOR", "COMPARE", "EXTEND", "DEFEND", "PREDICT", null], 
        default: null 
      },
      unitCode: { 
        type: String, 
        default: "" 
      },
      conceptTopics: [
        { type: String }
      ],
      targetTimeMinutes: { 
        type: Number, 
        default: 0 
      },
      difficulty: { 
        type: String, 
        enum: ["easy", "medium", "hard", null], 
        default: null 
      }
    }
  }, 
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Compound Indexes for Common Queries
taskSchema.index({ branchId: 1, projectName: 1, status: 1 }); // Dashboard filtering
taskSchema.index({ branchId: 1, assignee: 1, status: 1 });    // "My Tasks" filtering

export const Task = mongoose.model("Task", taskSchema);
