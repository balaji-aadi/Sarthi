import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Payment } from "../../models/payment.model.js";
import { User } from "../../models/user.model.js";

const createOrder = asyncHandler(async (req, res) => {
    const { plan, amount } = req.body;

    if (!plan || !amount) {
        throw new ApiError(400, "Plan and amount are required");
    }

    // Generate a dummy transaction ID
    const transactionId = "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const payment = await Payment.create({
        user: req.user._id,
        amount,
        plan,
        transactionId,
        status: "pending"
    });

    return res.status(201).json(new ApiResponse(201, payment, "Order created successfully"));
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { transactionId, status, gatewayToken } = req.body;
    
    // Simulate secure signature/token verification
    if (gatewayToken) {
        console.log(`[GATEWAY] Verified transaction ${transactionId} via ${gatewayToken}`);
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    if (status === "completed") {
        payment.status = "completed";
        await payment.save();

        // Update user subscription
        const user = await User.findById(req.user._id);
        user.subscriptionType = "paid";
        user.subscriptionPlan = payment.plan;

        const now = new Date();
        if (payment.plan === "monthly") {
            user.subscriptionExpiresAt = new Date(now.setMonth(now.getMonth() + 1));
        } else if (payment.plan === "half-yearly") {
            user.subscriptionExpiresAt = new Date(now.setMonth(now.getMonth() + 6));
        } else if (payment.plan === "yearly") {
            user.subscriptionExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
        } else if (payment.plan === "invitation") {
            user.subscriptionType = "free"; // Invitation is a temporary view
            user.invitationTimeRemaining = 300; // Reset to 5 mins
        }

        await user.save();
        return res.status(200).json(new ApiResponse(200, user, "Payment verified and subscription updated"));
    } else {
        payment.status = "failed";
        await payment.save();
        throw new ApiError(400, "Payment failed");
    }
});

const syncInvitationTime = asyncHandler(async (req, res) => {
    const { remainingTime } = req.body;
    
    if (typeof remainingTime !== "number") {
        throw new ApiError(400, "Invalid remaining time");
    }

    const user = await User.findById(req.user._id);
    user.invitationTimeRemaining = remainingTime;
    await user.save();

    return res.status(200).json(new ApiResponse(200, { remainingTime: user.invitationTimeRemaining }, "Time synced"));
});

export const SubscriptionController = {
    createOrder,
    verifyPayment,
    syncInvitationTime
};
