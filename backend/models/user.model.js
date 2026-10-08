import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

// User Schema Started
const userSchema = new Schema(
  {
    googleSub: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["USER", "SUPER_ADMIN"],
      default: "USER",
    },
    sessionVersion: {
      type: Number,
      default: 1,
    },
    userRole: {
      type: Schema.Types.ObjectId,
      ref: "UserRole",
    },
    userRoles: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserRole",
      }
    ],
    firstName: {
      type: String,
      maxlength: 250,
      required: true,
      default: "User",
    },
    lastName: {
      type: String,
      maxlength: 250,
      default: null,
    },
    phoneNumber: {
      type: String,
      maxlength: 15,
      required: false,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    branchAccess: [
      {
        branchId: {
          type: Schema.Types.ObjectId,
          ref: "Branch"
        },
        role: {
          type: String, // e.g., 'admin', 'manager', 'user'
          default: 'user'
        }
      }
    ],
    subscriptionType: {
      type: String,
      enum: ["free", "paid"],
      default: "free"
    },
    subscriptionPlan: {
      type: String,
      enum: ["free", "monthly", "half-yearly", "yearly", "invitation"],
      default: "free"
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null
    },
    invitationTimeRemaining: {
      type: Number,
      default: 300 // 5 minutes in seconds
    }
  },
  {
    timestamps: true,  
    versionKey: false, 
  }
);

// Database-level invariant: AT MOST ONE Super Admin across the entire database
userSchema.index(
  { role: 1 },
  {
    name: "unique_super_admin_single_instance",
    unique: true,
    partialFilterExpression: { role: "SUPER_ADMIN" },
  }
);

// User Schema End

userSchema.methods.generateAccessToken = function (sessionData = {}) {
  const payload = {
    _id: this._id,
    googleSub: this.googleSub,
    email: this.email,
    role: this.role || "USER",
    sessionVersion: this.sessionVersion || 1,
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    // Retain backward-compatible snake_case aliases
    first_name: this.firstName,
    last_name: this.lastName,
    phone_number: this.phoneNumber,
    ...sessionData,
  };

  return jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    }
  );
};

userSchema.methods.generateRefreshToken = function (sessionData = {}) {
  return jwt.sign(
    {
      _id: this._id,
      ...sessionData,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "14d",
    }
  );
};


export const User = mongoose.model("User", userSchema);

