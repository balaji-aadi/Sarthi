import { Router } from "express";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { verifyBranchAccess } from "../../../middlewares/branch.middleware.js";
import mdboard from "./dashboard.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyBranchAccess);

router.route("/project-Statistics").post(mdboard.projectStatistics);
router.route("/team-Statistics").post(mdboard.teamStatistics)
router.route("/user-Statistics").post(mdboard.userStatistics)
router.route("/task-deliverable").post(mdboard.todayTaskDeliverables)
router.route("/developer-Statistics").post(mdboard.developerStatistics)


export default router