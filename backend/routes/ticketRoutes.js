const express = require('express');
const {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');

const router = express.Router();

router.route('/').get(getTickets).post(createTicket);
router.route('/:id').put(updateTicket).delete(deleteTicket);

module.exports = router;
