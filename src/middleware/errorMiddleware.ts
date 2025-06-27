import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = "statusCode" in err ? err.statusCode : 500;

  res.status(statusCode).json({
    error: statusCode === 404 ? "Route not found" : "Internal server error",
    message: err.message,
    status: statusCode,
  });
};
