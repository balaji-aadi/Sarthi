import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import dailyAccountabilityController from "./dailyAccountability.controller.js";

const router = Router();

// Secure route tracking with user session
router.use(verifyJWT);

router.route("/")
    .get(dailyAccountabilityController.getBoard)
    .post(dailyAccountabilityController.saveBoard);

export default router;
