const express = require('express');
const {
  getPayments,
  getPaymentById,
  createPayment,
  importPayments,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.route('/')
  .get(requirePermission(PERMISSIONS.PAYMENTS_READ), getPayments)
  .post(requirePermission(PERMISSIONS.PAYMENTS_WRITE), createPayment);
router.post('/import', requirePermission(PERMISSIONS.PAYMENTS_WRITE), importPayments);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.PAYMENTS_READ), getPaymentById)
  .put(requirePermission(PERMISSIONS.PAYMENTS_WRITE), updatePayment)
  .delete(requirePermission(PERMISSIONS.PAYMENTS_DELETE), deletePayment);

module.exports = router;
