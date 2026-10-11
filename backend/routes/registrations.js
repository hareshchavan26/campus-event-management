import { Router } from 'express';
import { getMyRegistrations } from '../controllers/registrationsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/my-registrations (logged-in user)
router.get('/', requireAuth, getMyRegistrations);

export default router;
