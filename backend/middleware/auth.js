import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import pool from '../config/db.js';

/**
 * Verify JWT token and attach user payload to request
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please provide a valid Bearer token.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Authentication token missing.', 401));
    }

    const secret = process.env.JWT_SECRET || 'campus_events_super_secret_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    // Verify user still exists in database
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid authentication token.', 401));
    }
    next(error);
  }
};

/**
 * Restrict access to administrators only
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Access denied. Administrator privileges required.', 403));
  }
  next();
};

/**
 * Optional authentication: attaches user if token is present, does not fail if unauthenticated
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const secret = process.env.JWT_SECRET || 'campus_events_super_secret_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length > 0) {
      req.user = rows[0];
    }
    next();
  } catch (error) {
    // If optional auth fails, continue as guest
    next();
  }
};
