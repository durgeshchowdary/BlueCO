const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  markAllRead,
} = require('../controllers/announcementController');

const router = express.Router();

router.route('/').get(getAnnouncements).post(createAnnouncement);
router.put('/mark-all-read', markAllRead);
router.put('/:id', updateAnnouncement);

module.exports = router;
