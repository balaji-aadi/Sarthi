import mongoose, { Schema } from "mongoose";

const dailyRevisionSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    dateStr: {
      type: String, // format YYYY-MM-DD representing local date
      required: true
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      }
    ],
    completedQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      }
    ],
    reviseTomorrowQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      }
    ],
    isStarted: {
      type: Boolean,
      default: false
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    timeLeft: {
      type: Number,
      default: 10800 // 3 hours in seconds
    },
    timerIsActive: {
      type: Boolean,
      default: false
    },
    timerLastUpdated: {
      type: Date,
      default: null
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch"
    },
    currentQuestionStartTimeLeft: {
      type: Number,
      default: 10800
    },
    questionLogs: [
      {
        taskId: {
          type: Schema.Types.ObjectId,
          ref: "Task"
        },
        completedAtTimeLeft: Number,
        timeSpent: Number,
        notes: String
      }
    ]
  },
  { timestamps: true, versionKey: false }
);

// Ensure only one DailyRevision document per user per local day
dailyRevisionSchema.index({ userId: 1, dateStr: 1 }, { unique: true });

export const DailyRevision = mongoose.model("DailyRevision", dailyRevisionSchema);
