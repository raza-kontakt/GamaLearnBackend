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

    res
      .cookie("token", result.token, {
        // httpOnly: true,
        // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        // secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 60 * 1000, // 10 hours
        // domain: process.env.NODE_ENV === "production" ? undefined : undefined,
      })
      .status(200)
      .json({ examiner: result.examiner });
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
    res
      .clearCookie("token", {
        // httpOnly: true,
        // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        // secure: process.env.NODE_ENV === "production",
        // domain: process.env.NODE_ENV === "production" ? undefined : undefined,
      })
      .status(200)
      .json({ message: "Logged out successfully" });
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
