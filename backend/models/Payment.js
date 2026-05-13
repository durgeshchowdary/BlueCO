import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true },
  studentName: { type: String, default: '' },
  plan: {
    type: String,
    enum: ['trial', 'pro', 'legend', null],
    default: null,
    index: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  razorpayOrderId: { type: String, default: '', index: true },
  razorpayPaymentId: { type: String, default: '', index: true },
  razorpaySignature: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'created', 'paid', 'failed'],
    required: true,
  },
  month: { type: String, default: '' },
  paidAt: { type: Date, default: Date.now },
}, { timestamps: true });

paymentSchema.index({ paidAt: -1 });
paymentSchema.index({ academyId: 1, paidAt: -1 });
paymentSchema.index({ status: 1, month: 1 });

export default mongoose.model('Payment', paymentSchema);
