import mongoose, { Schema } from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    content: {
      type: String,
      default: ""
    },
    imageUrl: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: "#fef08a" // Default pastel yellow
    },
    position: {
      x: { type: Number, default: 100 },
      y: { type: Number, default: 100 }
    },
    size: {
      width: { type: Number, default: 250 },
      height: { type: Number, default: 180 }
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, versionKey: false }
);

export const Note = mongoose.model("Note", noteSchema);
