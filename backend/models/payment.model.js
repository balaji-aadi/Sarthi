import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    plan: {
        type: String,
        enum: ["monthly", "half-yearly", "yearly", "invitation"],
        required: true
    },
    transactionId: {
        type: String,
        unique: true,
        required: true
    }
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);
