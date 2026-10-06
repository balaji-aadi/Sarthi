import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  generateProblemDraft,
  getDrafts,
  getDraftById,
  validateDraft,
  approveDraft,
  rejectDraft
} from './questionFactory.controller.js';

const router = Router();

// Reusable Admin Guard matching existing CMS authorization
export const requireAdmin = (req, res, next) => {
  const user = req.user;
  const isAdmin =
    user?.email === "balajiaadi2000@gmail.com" ||
    user?.role === "admin" ||
    user?.userRole?.name?.toLowerCase() === "admin" ||
    (Array.isArray(user?.userRoles) && user.userRoles.some(r => r.name?.toLowerCase() === "admin"));

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Administrator privileges required for Question Factory operations."
    });
  }
  next();
};

router.post("/generate", verifyJWT, requireAdmin, generateProblemDraft);
router.get("/drafts", verifyJWT, requireAdmin, getDrafts);
router.get("/drafts/:id", verifyJWT, requireAdmin, getDraftById);
router.post("/drafts/:id/validate", verifyJWT, requireAdmin, validateDraft);
router.post("/drafts/:id/approve", verifyJWT, requireAdmin, approveDraft);
router.post("/drafts/:id/reject", verifyJWT, requireAdmin, rejectDraft);

export default router;
