const express = require('express');
const {
  getPayments,
  getPaymentById,
  createPayment,
  importPayments,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');

const router = express.Router();
router.route('/').get(getPayments).post(createPayment);
router.post('/import', importPayments);
router.route('/:id').get(getPaymentById).put(updatePayment).delete(deletePayment);

module.exports = router;
