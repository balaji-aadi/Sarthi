import mongoose, { Schema } from "mongoose";

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    module: {
      type: String, // e.g., 'PROJECT', 'TASK', 'USER'
      required: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Permission = mongoose.model("Permission", permissionSchema);
