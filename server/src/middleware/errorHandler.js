import { config } from '../config/index.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong';
  const code = err.code || 'INTERNAL_ERROR';

  if (config.nodeEnv === 'development' && !err.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}
