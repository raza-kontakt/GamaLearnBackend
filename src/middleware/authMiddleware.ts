import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: { id: number; userName: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Read token from cookies instead of Authorization header
  const token = req.cookies?.authToken;

  if (!token) {
    return next(new AppError('Authentication required', 401));
  }
  
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_default_secret'
    ) as { id: number; userName: string };
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
};
