import mongoose, { Schema } from "mongoose";

const bootstrapTokenSchema = new Schema(
  {
    hashedToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    consumed: {
      type: Boolean,
      default: false,
      index: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index auto-deletes expired records
    },
    createdBy: {
      type: String,
      default: "CLI_OPERATOR",
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const BootstrapToken = mongoose.model("BootstrapToken", bootstrapTokenSchema);
