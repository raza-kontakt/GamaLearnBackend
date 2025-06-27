import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        params: req.params,
        query: req.query,
        body: req.body,
      });
      return next();
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        details: error,
      });
    }
  };
