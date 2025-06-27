import { Router } from "express";
import {
  getExamSubmissions,
  getExamSubmission,
  getExamSubmissionFilters,
  searchStudentsInExamSubmission,
  switchAbsentToPaper,
  switchStudentSubmissionToPending,
} from "../controllers/examSubmissionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getExamSubmissions);
router.get("/filters", authMiddleware, getExamSubmissionFilters);
router.get(
  "/search-students/:assessmentId",
  authMiddleware,
  searchStudentsInExamSubmission
);
router.get("/:id", authMiddleware, getExamSubmission);

router.patch("/:id/switch-to-paper", authMiddleware, switchAbsentToPaper);
router.patch(
  "/:id/switch-to-pending",
  authMiddleware,
  switchStudentSubmissionToPending
);

export default router;
