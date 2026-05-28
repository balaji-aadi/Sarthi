import { Router } from "express";
import { BranchController } from "./branch.controller.js";
import { GlobalSettingsController } from "./settings.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(BranchController.createBranch).get(BranchController.getBranches);
router.route("/stats/:branchId").get(BranchController.getBranchStats);
router.route("/update/:branchId").patch(BranchController.updateBranch);
router.route("/delete/:branchId").post(BranchController.deleteBranch);
router.route("/settings").get(GlobalSettingsController.getSettings).patch(GlobalSettingsController.updateSettings);

export default router;
