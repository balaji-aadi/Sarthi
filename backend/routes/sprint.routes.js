import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import sprintController from "../services/sprint-service/sprint.controller.js";

import { checkPermission } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.use(verifyJWT); // Protect all sprint routes

router.post("/create", checkPermission("CREATE_SPRINT"), sprintController.createSprint);
router.get("/project/:projectId", checkPermission("VIEW_PROJECT"), sprintController.getSprintsByProject);
router.put("/:sprintId", checkPermission("CREATE_SPRINT"), sprintController.updateSprint);
router.delete("/:sprintId", checkPermission("CREATE_SPRINT"), sprintController.deleteSprint);

export default router;
