import { body, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Middleware to check validation results and forward errors if validation failed
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return next(new AppError('Validation failed. Please correct the highlighted fields.', 400, errorDetails));
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain at least one numerical digit.')
];

/**
 * Validation rules for user login
 */
export const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

/**
 * Validation rules for event creation and modification
 */
export const eventValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required.')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Event description is required.')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long.'),
  body('category_id')
    .notEmpty().withMessage('Category is required.')
    .isInt({ min: 1 }).withMessage('Valid category ID is required.'),
  body('venue')
    .trim()
    .notEmpty().withMessage('Venue is required.')
    .isLength({ max: 150 }).withMessage('Venue cannot exceed 150 characters.'),
  body('event_date')
    .notEmpty().withMessage('Event date is required.')
    .isISO8601().withMessage('Event date must be in YYYY-MM-DD format.')
    .custom((value) => {
      const today = new Date().toISOString().split('T')[0];
      if (value < today) {
        throw new Error('Event date cannot be in the past.');
      }
      return true;
    }),
  body('event_time')
    .trim()
    .notEmpty().withMessage('Event time is required.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Event time must be in HH:MM or HH:MM:SS format.'),
  body('capacity')
    .notEmpty().withMessage('Capacity is required.')
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer greater than 0.'),
  body('organizer')
    .trim()
    .notEmpty().withMessage('Organizer name is required.')
    .isLength({ max: 100 }).withMessage('Organizer cannot exceed 100 characters.'),
  body('image_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Image URL must be a valid URL.')
];
