import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  markAllRead,
} from '../controllers/announcementController.js';
import { requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

router.route('/') // Use .js extension for local imports
  .get(requirePermission(PERMISSIONS.ANNOUNCEMENTS_READ), getAnnouncements)
  .post(requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), createAnnouncement);
router.put('/mark-all-read', requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), markAllRead);
router.put('/:id', requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), updateAnnouncement);

export default router;
