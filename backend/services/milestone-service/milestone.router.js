import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/rbac.middleware.js";
import milestoneController from './milestone.controller.js';
import { verifyBranchAccess } from "../../middlewares/branch.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyBranchAccess);

router.route("/create-milestone/:projectId").post(checkPermission("CREATE_MILESTONE"), milestoneController.createMilestone)
router.route("/update-milestone/:milestoneId").put(checkPermission("UPDATE_MILESTONE"), milestoneController.updateMilestone)
router.route("/find-milestone/:milestoneId").get(checkPermission("VIEW_PROJECT"), milestoneController.getMilestonebyId)
router.route("/find-all-milestone").post(checkPermission("VIEW_PROJECT"), milestoneController.getAllMilestone)
router.route("/delete-milestone/:milestoneId").delete(checkPermission("DELETE_MILESTONE"), milestoneController.deleteMilestone)


export default router;