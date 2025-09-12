import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { config } from '../config/index.js';
import { ZodError } from 'zod';

const logger = pino({
  name: 'error-handler',
  level: config.logLevel,
});

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Log error
  logger.error('Error occurred:', {
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    timestamp: new Date().toISOString(),
  });

  // Send error response
  const errorResponse: any = {
    error: {
      message,
      statusCode,
    },
  };

  // Include validation details for Zod errors
  if (error instanceof ZodError) {
    errorResponse.error.details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
}
