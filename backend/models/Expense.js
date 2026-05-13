import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true, index: true },
    category: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    spentAt: { type: Date, default: Date.now, index: true },
    vendor: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

expenseSchema.index({ academyId: 1, spentAt: -1 });

export default mongoose.model('Expense', expenseSchema);
