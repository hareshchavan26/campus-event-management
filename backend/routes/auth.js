import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, registerValidationRules, loginValidationRules } from '../middleware/validate.js';

const router = Router();

// POST /api/auth/register
router.post('/register', registerValidationRules, validate, register);

// POST /api/auth/login
router.post('/login', loginValidationRules, validate, login);

// GET /api/auth/me
router.get('/me', requireAuth, getMe);

export default router;
