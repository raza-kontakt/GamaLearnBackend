import { NextFunction, Request, Response } from "express";
import { getLang } from "../utils";
import {
  getExamSubmissionsService,
  getExamSubmissionFiltersService,
} from "../services/examSubmissionService";
import prisma from "../libs/prisma";

export const getExamSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = String(getLang(req));
    const {
      studentId,
      assessmentId,
      areaId,
      status,
      sessionHealth,
      page,
      limit,
    } = req.query;

    const filter: any = {
      ...(studentId && { studentId: Number(studentId) }),
      ...(assessmentId && { assessmentId: Number(assessmentId) }),
      ...(areaId && {
        assessment: {
          areaId: Number(areaId),
        },
      }),
    };

    // Validate status against enum values
    const validStatuses = [
      "ABSENT",
      "PENDING",
      "MOVED_TO_PAPER",
      "IN_PROGRESS",
      "BLOCKED",
      "DENIED",
      "STUDENT_SUBMISSION",
      "TIMER_SUBMISSION",
    ];

    if (status && validStatuses.includes(String(status))) {
      filter.status = status;
    }

    if (sessionHealth) filter.sessionHealth = sessionHealth;

    const result = await getExamSubmissionsService({
      lang,
      filter,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    return res.send(result);
  } catch (err) {
    return next(err);
  }
};

export const switchAbsentToPaper = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const submission = await prisma.examSubmission.findUnique({
      where: { id: Number(id) },
    });
    if (!submission) {
      return res.status(404).json({ message: "Exam submission not found" });
    }
    if (submission.status !== "ABSENT") {
      return res
        .status(400)
        .json({ message: "Submission is not in ABSENT status" });
    }
    await prisma.examSubmission.update({
      where: { id: Number(id) },
      data: { status: "MOVED_TO_PAPER" },
    });
    return res.json({
      message: "Submission status switched to MOVED_TO_PAPER",
    });
  } catch (err) {
    return next(err);
  }
};

export const switchStudentSubmissionToPending = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const submission = await prisma.examSubmission.findUnique({
      where: { id: Number(id) },
    });
    if (!submission) {
      return res.status(404).json({ message: "Exam submission not found" });
    }
    if (submission.status !== "STUDENT_SUBMISSION") {
      return res
        .status(400)
        .json({ message: "Submission is not in STUDENT_SUBMISSION status" });
    }
    await prisma.examSubmission.update({
      where: { id: Number(id) },
      data: { status: "PENDING", questionsSync: 0, timeElapsed: 0 },
    });
    return res.json({ message: "Submission status switched to PENDING" });
  } catch (err) {
    return next(err);
  }
};
