import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sessionVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    previousRefreshTokenHashes: [
      {
        type: String,
        index: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for fast lookup of active sessions by user
sessionSchema.index({ userId: 1, isActive: 1 });

export const Session = mongoose.model("Session", sessionSchema);
