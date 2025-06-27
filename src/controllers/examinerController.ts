import { Request, Response, NextFunction } from "express";
import { loginExaminer, getExaminer } from "../services/examinerService";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/authMiddleware";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName, password } = req.body;
    const result = await loginExaminer(userName, password);

    res.status(200).json({ 
      examiner: result.examiner,
      token: result.token
    });
  } catch (error) {
    console.log(error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError("Internal server error", 500));
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

export const getExaminerController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) return next(new AppError("Unauthorized", 401));
    const examiner = await getExaminer(user.id);
    if (!examiner) return next(new AppError("Examiner not found", 404));
    res.json(examiner);
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};
