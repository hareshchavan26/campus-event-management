import pool from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * GET /api/categories
 * Retrieve all event categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const [categories] = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
});
