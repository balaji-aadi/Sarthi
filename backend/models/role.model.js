import mongoose, { Schema } from "mongoose";


const userRoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 250,
      unique: true,
    },
    permissions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Permission"
        }
    ],
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false, 
  }
);

userRoleSchema.pre("save", function (next) {
  this.name = this.name.toLowerCase().replace(" ", "");
  next();
});

export const ROLES = {
  ADMIN: "admin",
  PROJECT_MANAGER: "projectmanager",
  HR: "hr",
  EMPLOYEE: "employee"
};

export const UserRole = mongoose.model("UserRole", userRoleSchema);
