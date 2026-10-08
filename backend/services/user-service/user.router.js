import { Router } from "express";
import { verifyJWT, optionalVerifyJWT } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/rbac.middleware.js";
import userController from "./user.controller.js";
import { verifyBranchAccess } from "../../middlewares/branch.middleware.js";

const router = Router();

// Primary Google Authentication & Session Lifecycle
router.route("/google-login").post(userController.googleLogin);
router.route("/bootstrap-super-admin").post(userController.bootstrapSuperAdmin);
router.route("/super-admin/recovery-challenge").post(userController.recoveryChallenge);
router.route("/super-admin/recover").post(userController.recoverSuperAdmin);
router.route("/refresh-token").post(userController.refreshAccessToken);
router.route("/logout").post(optionalVerifyJWT, userController.logoutUser);
router.route("/current-user").get(verifyJWT, userController.getCurrentUser);
router.route("/update-account").patch(verifyJWT, userController.updateAccountDetails);
router.route("/create-fcm-token").post(optionalVerifyJWT, userController.createFCMToken);

// Disabled legacy endpoints
router.route("/register").post(userController.registerUser);
router.route("/login").post(userController.loginUser);
router.route("/zoho-login").post(userController.zohoLogin);
router.route("/generate-otp").post(userController.generateOTP);
router.route("/verify-otp").post(userController.verifyOTP);
router.route("/reset-password").post(userController.resetPassword);
router.route("/change-password").post(verifyJWT, userController.changeCurrentPassword);

// Administrative User Management
router.route("/get-all-user").post(verifyJWT, verifyBranchAccess, checkPermission("UPDATE_USER"), userController.getAllUsers);
router.route("/get-user-by-id/:userId").get(verifyJWT, verifyBranchAccess, checkPermission("UPDATE_USER"), userController.getUserById);
router.route("/update-user/:userId").put(verifyJWT, verifyBranchAccess, checkPermission("UPDATE_USER"), userController.updateUser);
router.route("/bulk-update-status").post(verifyJWT, verifyBranchAccess, checkPermission("UPDATE_USER"), userController.bulkUpdateUserStatus);

export default router;
