import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";
import sprintController from './sprint.controller.js';

const router = Router();

// Create: Requires CREATE_SPRINT
router.route("/create-sprint").post(verifyJWT, checkPermission('CREATE_SPRINT'), sprintController.createSprint);

// Update: Requires CREATE_SPRINT (as a proxy for Manage Sprints) or specific if added later
router.route("/update-sprint/:sprintId").put(verifyJWT, checkPermission('CREATE_SPRINT'), sprintController.updateSprint);

// Get: Accessible to authenticated users (Project membership check inside controller ideally, but open for now)
router.route("/get-sprints/:projectId").get(verifyJWT, sprintController.getSprintsByProject);

// Delete: Requires CREATE_SPRINT (Proxy for Manage)
router.route("/delete-sprint/:sprintId").delete(verifyJWT, checkPermission('CREATE_SPRINT'), sprintController.deleteSprint);

// Report: Accessible to all (or maybe restricted to PManager, let's allow all for now as it's a view)
router.route("/report/:sprintId").get(verifyJWT, sprintController.getSprintReport);

export default router;
