import { Router } from "express";
import {
  getExamSubmissions,
  getExamSubmission,
  getExamSubmissionFilters,
  searchStudentsInExamSubmission,
  switchAbsentToPaper,
  switchStudentSubmissionToPending,
} from "../controllers/examSubmissionController";

const router = Router();

router.get("/", getExamSubmissions);
router.get("/filters", getExamSubmissionFilters);
router.get("/search-students/:assessmentId", searchStudentsInExamSubmission);
router.get("/:id", getExamSubmission);

router.patch("/:id/switch-to-paper", switchAbsentToPaper);
router.patch("/:id/switch-to-pending", switchStudentSubmissionToPending);

export default router;
