import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventsController.js';
import {
  registerForEvent,
  cancelRegistration,
  getEventRegistrations
} from '../controllers/registrationsController.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validate, eventValidationRules } from '../middleware/validate.js';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', optionalAuth, getEventById);

// Admin-only event management
router.post('/', requireAuth, requireAdmin, eventValidationRules, validate, createEvent);
router.put('/:id', requireAuth, requireAdmin, eventValidationRules, validate, updateEvent);
router.delete('/:id', requireAuth, requireAdmin, deleteEvent);

// Registration actions (authenticated users)
router.post('/:id/register', requireAuth, registerForEvent);
router.delete('/:id/register', requireAuth, cancelRegistration);

// Admin-only event registration attendees
router.get('/:id/registrations', requireAuth, requireAdmin, getEventRegistrations);

export default router;
