const express = require('express');
const {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.route('/')
  .get(requirePermission(PERMISSIONS.TICKETS_READ), getTickets)
  .post(requirePermission(PERMISSIONS.TICKETS_WRITE), createTicket);
router.route('/:id')
  .put(requirePermission(PERMISSIONS.TICKETS_WRITE), updateTicket)
  .delete(requirePermission(PERMISSIONS.TICKETS_DELETE), deleteTicket);

module.exports = router;
