import mongoose, { Schema } from "mongoose";

const dailyAccountabilitySchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sections: {
      type: Array, // Flexible array storing the complex multi-section topic grid structure
      default: []
    }
  },
  { timestamps: true, versionKey: false }
);

export const DailyAccountability = mongoose.model("DailyAccountability", dailyAccountabilitySchema);
