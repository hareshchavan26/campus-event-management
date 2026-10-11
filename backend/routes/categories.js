import { Router } from 'express';
import { getCategories } from '../controllers/categoriesController.js';

const router = Router();

// GET /api/categories (public)
router.get('/', getCategories);

export default router;
