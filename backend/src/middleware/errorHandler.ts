import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error(err);

  // Mongoose 重复键错误
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = '数据重复错误';
    error = new Error(message) as CustomError;
    error.statusCode = 400;
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message);
    error = new Error(message.join(', ')) as CustomError;
    error.statusCode = 400;
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的令牌';
    error = new Error(message) as CustomError;
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器内部错误'
  });
}; 