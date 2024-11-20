import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    return next();
  }

  logger.error('Unexpected error:', err);

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message,
  });
  return next();
};

// 捕获未处理的Promise异常
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// 捕获未捕获的异常
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
}); 