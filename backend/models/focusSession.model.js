import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    type: {
      type: String,
      default: "Focus",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    taskName: {
      type: String,
    },
    taskIdString: {
      type: String,
    },
    statusAtCompletion: {
      type: String, // 'todo', 'hold', 'done', 'backlog'
    },
    completionState: {
      type: String, // 'completed', 'incompleted'
    },
    estimatedTimeAtStart: {
      type: Number, // In minutes
    },
    backlogTimeAdded: {
      type: Number, // In minutes
    }
  },
  { timestamps: true }
);

export const FocusSession = mongoose.model("FocusSession", focusSessionSchema);
