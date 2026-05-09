const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending'], required: true },
  month: { type: String, required: true },
  paidAt: { type: Date, default: Date.now },
});

paymentSchema.index({ paidAt: -1 });
paymentSchema.index({ status: 1, month: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
