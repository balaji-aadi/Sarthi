import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/rbac.middleware.js";
import milestoneController from './milestone.controller.js';

const router = Router();

router.route("/create-milestone/:projectId").post(verifyJWT, checkPermission("CREATE_MILESTONE"), milestoneController.createMilestone)
router.route("/update-milestone/:milestoneId").put(verifyJWT, checkPermission("UPDATE_MILESTONE"), milestoneController.updateMilestone)
router.route("/find-milestone/:milestoneId").get(verifyJWT, checkPermission("VIEW_PROJECT"), milestoneController.getMilestonebyId)
router.route("/find-all-milestone").post(verifyJWT, checkPermission("VIEW_PROJECT"), milestoneController.getAllMilestone)
router.route("/delete-milestone/:milestoneId").delete(verifyJWT, checkPermission("DELETE_MILESTONE"), milestoneController.deleteMilestone)


export default router;