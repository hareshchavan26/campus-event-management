/**
 * Custom Error class with HTTP status code support
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async wrapper to eliminate repetitive try-catch blocks in Express route controllers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Centralized error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  // Handle specific MySQL errors gracefully
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A duplicate record already exists with this information.',
      error: 'Conflict'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Invalid foreign reference provided (e.g., category or user does not exist).',
      error: 'Foreign Key Violation'
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { errors: err.details } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};
