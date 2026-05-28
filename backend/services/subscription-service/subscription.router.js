import { Router } from "express";
import { SubscriptionController } from "./subscription.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/create-order", SubscriptionController.createOrder);
router.post("/verify-payment", SubscriptionController.verifyPayment);
router.post("/sync-time", SubscriptionController.syncInvitationTime);

export default router;
