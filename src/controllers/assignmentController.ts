import { NextFunction, Request, Response } from 'express';
import { getLang } from '../utils';
import { getAssignmentsService } from '../services/assignmentService';

export const getAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = String(getLang(req));
    const {
      area: areaId,
      program: programId,
      course: courseId,
      status,
      page,
      limit,
    } = req.query;

    const filter: any = {};

    if (areaId) {
      filter.areaId = Number(areaId);
    }
    if (status && typeof status === 'string' && status) {
      filter.status = status;
    }

    if (courseId) {
      filter.courseId = Number(courseId);
    } else if (programId) {
      filter.course = {
        programId: Number(programId),
      };
    }

    const result = await getAssignmentsService({
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

export const syncAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = String(getLang(req));
    const filter = { id: Number(id) };
    const result = await getAssignmentsService({
      lang,
      filter,
      page: 1,
      limit: 1,
    });
    if (!result.data || result.data.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    return res.json({ assessment: result.data[0] });
  } catch (err) {
    return next(err);
  }
};
