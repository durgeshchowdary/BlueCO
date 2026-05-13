import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true, index: true },
    source: { type: String, enum: ['student_fee', 'subscription', 'event', 'other'], default: 'student_fee', index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    receivedAt: { type: Date, default: Date.now, index: true },
    referenceId: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

revenueSchema.index({ academyId: 1, receivedAt: -1 });

export default mongoose.model('Revenue', revenueSchema);
