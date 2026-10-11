import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Generate a signed JWT token valid for 7 days
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'campus_events_super_secret_jwt_key_2026_dev';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/auth/register
 * Register a new student account
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // New self-registrations default to student role
  const role = 'student';

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  );

  const newUser = {
    id: result.insertId,
    name,
    email,
    role
  };

  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    token,
    user: newUser
  });
});

/**
 * POST /api/auth/login
 * Authenticate existing user and return JWT
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // Construct safe user object without password_hash
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const token = generateToken(safeUser);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    token,
    user: safeUser
  });
});

/**
 * GET /api/auth/me
 * Get profile of current logged in user
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});
