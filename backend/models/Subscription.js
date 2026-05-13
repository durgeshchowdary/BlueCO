import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    plan: { type: String, enum: ['trial', 'pro', 'legend'], default: 'trial' },
    status: { type: String, enum: ['trial', 'active', 'past_due', 'suspended', 'cancelled'], default: 'trial' },
    monthlyAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    trialStartedAt: { type: Date, default: Date.now },
    trialEndsAt: { type: Date, default: null },
    bufferUntil: { type: Date, default: null },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    lastPaymentId: { type: String, default: '' },
    lastOrderId: { type: String, default: '' },
    renewsAt: { type: Date, default: null },
  },
  { timestamps: true },
);

subscriptionSchema.index({ academyId: 1, status: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
