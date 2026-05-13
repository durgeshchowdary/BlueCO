import express from 'express';
import { authenticateUser, requireAcademyScope } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getCommunicationLogs,
} from '../controllers/notificationController.js';

const router = express.Router();
router.use(authenticateUser, requireAcademyScope);

router.get('/', getNotifications);
router.get('/communication-logs', getCommunicationLogs);
router.post('/read-all', markAllNotificationsRead);
router.post('/:id/read', markNotificationRead);

export default router;
