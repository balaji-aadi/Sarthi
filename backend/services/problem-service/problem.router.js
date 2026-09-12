import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  createProblem,
  checkSlugAvailability,
  getAllProblems,
  getProblemBySlugOrId,
  updateProblem,
  archiveProblem,
  compileProblemPackage,
  publishProblemPackage
} from "./problem.controller.js";

import {
  getCompanies,
  createCompany,
  deleteCompany,
  getTopics,
  createTopic,
  deleteTopic,
  getPatterns,
  createPattern,
  deletePattern,
  seedDefaults,
  getLanguages,
  createLanguage
} from "./companyTopic.controller.js";

const router = Router();

// Middleware to enforce Admin authorization for CMS / Studio mutations
const requireAdmin = (req, res, next) => {
  const user = req.user;
  const isAdmin =
    user?.email === "balajiaadi2000@gmail.com" ||
    user?.role === "admin" ||
    user?.userRole?.name?.toLowerCase() === "admin" ||
    (Array.isArray(user?.userRoles) && user.userRoles.some(r => r.name?.toLowerCase() === "admin"));

  if (!isAdmin) {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required for Studio CMS mutations." });
  }
  next();
};

// Problem Package Compilation & Publishing Routes (Admin Only)
router.post("/package/compile", verifyJWT, requireAdmin, compileProblemPackage);
router.post("/package/publish", verifyJWT, requireAdmin, publishProblemPackage);

// Problem Routes (Read: Public/Authenticated; Mutations: Admin Only)
router.post("/", verifyJWT, requireAdmin, createProblem);
router.get("/check-slug", checkSlugAvailability);
router.get("/", getAllProblems);
router.get("/:identifier", getProblemBySlugOrId);
router.put("/:id", verifyJWT, requireAdmin, updateProblem);
router.delete("/:id", verifyJWT, requireAdmin, archiveProblem);

// Metadata & Tag Routes (Read: Public; Mutations: Admin Only)
router.get("/meta/companies", getCompanies);
router.post("/meta/companies", verifyJWT, requireAdmin, createCompany);
router.delete("/meta/companies/:id", verifyJWT, requireAdmin, deleteCompany);

router.get("/meta/topics", getTopics);
router.post("/meta/topics", verifyJWT, requireAdmin, createTopic);
router.delete("/meta/topics/:id", verifyJWT, requireAdmin, deleteTopic);

router.get("/meta/patterns", getPatterns);
router.post("/meta/patterns", verifyJWT, requireAdmin, createPattern);
router.delete("/meta/patterns/:id", verifyJWT, requireAdmin, deletePattern);

router.post("/meta/seed-defaults", verifyJWT, requireAdmin, seedDefaults);

router.get("/meta/languages", getLanguages);
router.post("/meta/languages", verifyJWT, requireAdmin, createLanguage);

export default router;
