import mongoose, { Schema } from "mongoose";

const branchSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String
    },
    logo: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "private"
    }
}, { timestamps: true });

export const Branch = mongoose.model("Branch", branchSchema);
