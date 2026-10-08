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

import { isSuperAdmin } from '../../middlewares/rbac.middleware.js';

// Reusable Admin Guard matching existing CMS authorization
export const requireAdmin = (req, res, next) => {
  if (!isSuperAdmin(req.user)) {
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
