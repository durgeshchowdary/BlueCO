import mongoose from 'mongoose';

const invoiceLineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitAmount: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['subscription', 'receipt', 'payroll', 'student_fee'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'suspended'],
      default: 'draft',
      index: true,
    },
    currency: { type: String, default: 'INR' },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    gstin: { type: String, default: '' },
    billingName: { type: String, default: '' },
    billingEmail: { type: String, default: '' },
    dueAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    razorpayPaymentId: { type: String, default: '' },
    lineItems: [invoiceLineItemSchema],
    pdfPath: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

invoiceSchema.index({ academyId: 1, status: 1, createdAt: -1 });
invoiceSchema.index({ type: 1, dueAt: 1 });

export default mongoose.model('Invoice', invoiceSchema);
