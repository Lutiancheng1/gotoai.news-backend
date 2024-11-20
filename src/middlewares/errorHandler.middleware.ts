import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error(`Rate limit error: ${err.message}`);
    res.status(429).json({
      status: 'error',
      message: err.message
    });
  }
  next(err);
}; 