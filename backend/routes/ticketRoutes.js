import express from 'express';
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../controllers/ticketController.js';
import { requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

router.route('/') // Use .js extension for local imports
  .get(requirePermission(PERMISSIONS.TICKETS_READ), getTickets)
  .post(requirePermission(PERMISSIONS.TICKETS_WRITE), createTicket);
router.route('/:id')
  .put(requirePermission(PERMISSIONS.TICKETS_WRITE), updateTicket)
  .delete(requirePermission(PERMISSIONS.TICKETS_DELETE), deleteTicket);

export default router;
