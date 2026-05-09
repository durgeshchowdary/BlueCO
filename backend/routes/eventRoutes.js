const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.route('/')
  .get(requirePermission(PERMISSIONS.EVENTS_READ), getEvents)
  .post(requirePermission(PERMISSIONS.EVENTS_WRITE), createEvent);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.EVENTS_READ), getEventById)
  .put(requirePermission(PERMISSIONS.EVENTS_WRITE), updateEvent)
  .delete(requirePermission(PERMISSIONS.EVENTS_DELETE), deleteEvent);

module.exports = router;
