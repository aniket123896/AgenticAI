import { sendError } from '../utils/responseHandler.js';

export const notFound = (req, res, next) => {
  sendError(res, 404, `Resource not found - ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = `Resource not found with invalid ID: ${err.value}`;
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for '${field}'. Please use another value.`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token has expired';
    statusCode = 401;
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : null);
};
