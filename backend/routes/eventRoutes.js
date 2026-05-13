import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();
router.route('/') // Use .js extension for local imports
  .get(requirePermission(PERMISSIONS.EVENTS_READ), getEvents)
  .post(requirePermission(PERMISSIONS.EVENTS_WRITE), createEvent);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.EVENTS_READ), getEventById)
  .put(requirePermission(PERMISSIONS.EVENTS_WRITE), updateEvent)
  .delete(requirePermission(PERMISSIONS.EVENTS_DELETE), deleteEvent);

export default router;
