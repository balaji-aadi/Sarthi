import mongoose, { Schema } from "mongoose";

const globalSettingsSchema = new Schema({
    subscriptionType: {
        type: String,
        enum: ["free", "1-year", "paid"],
        default: "free"
    },
    subscriptionStartDate: {
        type: Date
    },
    subscriptionEndDate: {
        type: Date
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const GlobalSettings = mongoose.model("GlobalSettings", globalSettingsSchema);
