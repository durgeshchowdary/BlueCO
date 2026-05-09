const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  markAllRead,
} = require('../controllers/announcementController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.route('/')
  .get(requirePermission(PERMISSIONS.ANNOUNCEMENTS_READ), getAnnouncements)
  .post(requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), createAnnouncement);
router.put('/mark-all-read', requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), markAllRead);
router.put('/:id', requirePermission(PERMISSIONS.ANNOUNCEMENTS_WRITE), updateAnnouncement);

module.exports = router;
