import { Router } from "express";
import { FocusController } from "./focus.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/session", FocusController.createSession);
router.delete("/session/:id", FocusController.deleteSession);
router.get("/sessions", FocusController.getSessions);
router.get("/today-stats", FocusController.getTodayStats);

export default router;
