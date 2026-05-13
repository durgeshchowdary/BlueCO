import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  importPayments,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController.js';
import { authenticateUser, requireAcademyScope, requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();
router.post('/webhook/razorpay', handleRazorpayWebhook); // Use .js extension for local imports
router.post('/create-order', authenticateUser, requireAcademyScope, createRazorpayOrder); // Use .js extension for local imports
router.post('/verify-payment', authenticateUser, requireAcademyScope, verifyRazorpayPayment); // Use .js extension for local imports
router.route('/') // Use .js extension for local imports
  .get(requirePermission(PERMISSIONS.PAYMENTS_READ), getPayments)
  .post(requirePermission(PERMISSIONS.PAYMENTS_WRITE), createPayment);
router.post('/import', requirePermission(PERMISSIONS.PAYMENTS_WRITE), importPayments);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.PAYMENTS_READ), getPaymentById)
  .put(requirePermission(PERMISSIONS.PAYMENTS_WRITE), updatePayment)
  .delete(requirePermission(PERMISSIONS.PAYMENTS_DELETE), deletePayment);

export default router;
