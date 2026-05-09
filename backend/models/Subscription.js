const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    plan: { type: String, enum: ['trial', 'starter', 'pro', 'enterprise'], default: 'trial' },
    status: { type: String, enum: ['active', 'past_due', 'cancelled', 'trial'], default: 'trial' },
    monthlyAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    renewsAt: { type: Date, default: null },
  },
  { timestamps: true },
);

subscriptionSchema.index({ academyId: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
