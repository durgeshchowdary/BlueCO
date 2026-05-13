import express from 'express';
import {
  getCoaches,
  getCoachById,
  createCoach,
  importCoaches,
  updateCoach,
  deleteCoach,
} from '../controllers/coachController.js';
import { requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();
router.route('/') // Use .js extension for local imports
  .get(requirePermission(PERMISSIONS.COACHES_READ), getCoaches)
  .post(requirePermission(PERMISSIONS.COACHES_WRITE), createCoach);
router.post('/import', requirePermission(PERMISSIONS.COACHES_WRITE), importCoaches);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.COACHES_READ), getCoachById)
  .put(requirePermission(PERMISSIONS.COACHES_WRITE), updateCoach)
  .delete(requirePermission(PERMISSIONS.COACHES_DELETE), deleteCoach);

export default router;
