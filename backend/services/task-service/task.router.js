import { Router } from "express";
import { verifyJWT, optionalVerifyJWT } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/rbac.middleware.js";
import { canUpdateTask } from "../../middlewares/resource.middleware.js";
import taskController from "./task.controller.js";
import taskImports from "./taskimport.js";
import upload from "../../middlewares/multer.middleware.js";
import { verifyBranchAccess } from "../../middlewares/branch.middleware.js";
import { getLldWorkspaceContext, submitLldTaskProgress } from "./lldWorkspace.controller.js";

const router = Router();

// LLD Workspace Routes (Direct Program execution context & submission)
router.route("/:id/lld-workspace").get(optionalVerifyJWT, getLldWorkspaceContext);
router.route("/:id/lld-submit").post(verifyJWT, submitLldTaskProgress);

router.route("/create-task").post(verifyJWT, verifyBranchAccess, checkPermission("CREATE_TASK"), taskController.createTask);
router.route("/get-last-created").get(verifyJWT, verifyBranchAccess, taskController.getLastCreatedTask);
router.route("/update-task/:taskId").put(verifyJWT, verifyBranchAccess, canUpdateTask, taskController.updateTask);
router.route("/get-tasks/:taskId").get(verifyJWT, verifyBranchAccess, checkPermission(["VIEW_TASK", "VIEW_ASSIGNED_TASK"]), taskController.getTaskById);
router.route("/get-all-tasks").post(verifyJWT, verifyBranchAccess, taskController.getallTasks);
router.route("/get-alltask-free").post(verifyJWT, verifyBranchAccess, checkPermission("VIEW_TASK"), taskController.getallTasksfree);
router.route("/delete-task/:taskId").delete(verifyJWT, verifyBranchAccess, checkPermission("DELETE_TASK"), taskController.deleteTask);
router.route("/update-task-log/:taskId").patch(verifyJWT, verifyBranchAccess, canUpdateTask, taskController.updatetaskLog);
router.route("/task-import").post(verifyJWT, verifyBranchAccess, checkPermission("CREATE_TASK"), upload.single("file"), taskImports);
router.route("/deletemilestone/:milestoneId").post(verifyJWT, verifyBranchAccess, checkPermission("DELETE_MILESTONE"), taskController.deletemilestone)
router.route("/add-revision/:taskId").post(verifyJWT, verifyBranchAccess, taskController.addRevision);
router.route("/revision-stats").get(verifyJWT, verifyBranchAccess, taskController.getRevisionStats);
router.route("/completed-parents").get(verifyJWT, verifyBranchAccess, taskController.getCompletedParents);
router.route("/suggest-challenge").post(verifyJWT, verifyBranchAccess, taskController.suggestRevisionChallenge);
router.route("/reflection/:taskId").post(verifyJWT, verifyBranchAccess, taskController.recordReflection);

router.route("/daily-revision").get(verifyJWT, verifyBranchAccess, taskController.getDailyRevision);
router.route("/daily-revision/start").post(verifyJWT, verifyBranchAccess, taskController.startDailyRevision);
router.route("/daily-revision/toggle-timer").post(verifyJWT, verifyBranchAccess, taskController.toggleDailyRevisionTimer);
router.route("/daily-revision/sync-timer").post(verifyJWT, verifyBranchAccess, taskController.syncDailyRevisionTimer);
router.route("/daily-revision/toggle-revise-tomorrow").post(verifyJWT, verifyBranchAccess, taskController.toggleReviseTomorrow);

// Phase 4: Pattern Alerts
router.route("/patterns/alerts").get(verifyJWT, verifyBranchAccess, taskController.getPatternAlerts);

export default router;
