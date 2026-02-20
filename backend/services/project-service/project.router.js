import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/rbac.middleware.js";
import projectController from './project.controller.js';

const router = Router();

router.route("/create-project").post(verifyJWT, checkPermission("CREATE_PROJECT"), projectController.createProject)
router.route("/update-project/:projectId").put(verifyJWT, checkPermission("UPDATE_PROJECT"), projectController.updateProject)
router.route("/get-projects/:projectId").get(verifyJWT, checkPermission("VIEW_PROJECT"), projectController.getProjectById)
router.route("/get-all-projects").post(verifyJWT, projectController.getAllProject)
router.route("/delete-project/:projectId").delete(verifyJWT, checkPermission("DELETE_PROJECT"), projectController.deleteProject)


export default router;