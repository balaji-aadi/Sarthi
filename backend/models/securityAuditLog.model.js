import mongoose, { Schema } from "mongoose";

const securityAuditLogSchema = new Schema(
  {
    event: {
      type: String,
      required: true,
      enum: [
        "BOOTSTRAP_INITIATED",
        "BOOTSTRAP_SUCCESS",
        "BOOTSTRAP_FAILED",
        "RECOVERY_ATTEMPT",
        "RECOVERY_FAILED",
        "RECOVERY_SUCCESS",
        "SUPER_ADMIN_DEMOTED",
      ],
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SecurityAuditLog = mongoose.model("SecurityAuditLog", securityAuditLogSchema);
