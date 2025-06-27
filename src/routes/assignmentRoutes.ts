import express from "express";

import {
  getAssignments,
  syncAssignment,
} from "../controllers/assignmentController";
import { validate } from "../utils/validation";
import { getAllSchema } from "../schemas/assignmentSchema";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", validate(getAllSchema), authMiddleware, getAssignments);
router.get("/sync/:id", validate(getAllSchema), authMiddleware, syncAssignment);

export default router;
