import { NextFunction, Request, Response } from "express";
import { getLang } from "../utils";
import {
  getExamSubmissionsService,
  getExamSubmissionFiltersService,
  searchStudentsInExamSubmissionService,
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

export const getExamSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = String(getLang(req));
    const filter = { id: Number(id) };
    const result = await getExamSubmissionsService({
      lang,
      filter,
      page: 1,
      limit: 1,
    });
    if (!result.data || result.data.length === 0) {
      return res.status(404).json({ message: "Exam submission not found" });
    }
    return res.json({ submission: result.data[0] });
  } catch (err) {
    return next(err);
  }
};

export const getExamSubmissionFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = String(getLang(req));
    const { student, assessment, area, status, sessionHealth } = req.query;

    const filters: any = {};
    if (student) filters.student = true;
    if (assessment) filters.assessment = true;
    if (area) filters.area = true;
    if (status) filters.status = true;
    if (sessionHealth) filters.sessionHealth = true;

    const filterOptions = await getExamSubmissionFiltersService(lang, filters);
    return res.json(filterOptions);
  } catch (err) {
    return next(err);
  }
};

export const searchStudentsInExamSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assessmentId } = req.params;
    const { searchTerm, limit } = req.query;
    const lang = String(getLang(req));

    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({ message: "Search term is required" });
    }

    const students = await searchStudentsInExamSubmissionService(
      Number(assessmentId),
      searchTerm,
      lang,
      Number(limit) || 5
    );

    return res.json({ students });
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
