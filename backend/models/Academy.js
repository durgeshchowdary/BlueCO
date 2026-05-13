import mongoose from 'mongoose';

const academySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    city: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial'],
      default: 'trial',
    },
    ownerName: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    featureFlags: [{ type: String }],
    subscription: {
      plan: {
        type: String,
        enum: ['trial', 'pro', 'legend'],
        default: 'trial',
      },
      status: {
        type: String,
        enum: ['trial', 'active', 'past_due', 'suspended', 'cancelled'],
        default: 'trial',
      },
      trialStartedAt: { type: Date, default: Date.now },
      trialEndsAt: { type: Date, default: null },
      currentPeriodStart: { type: Date, default: null },
      currentPeriodEnd: { type: Date, default: null },
      bufferUntil: { type: Date, default: null },
      lastPaymentId: { type: String, default: '' },
      lastOrderId: { type: String, default: '' },
      paidAt: { type: Date, default: null },
    },
    compliance: {
      dltDocuments: {
        registration: {
          fileName: { type: String, default: '' },
          originalName: { type: String, default: '' },
          mimeType: { type: String, default: '' },
          size: { type: Number, default: 0 },
          storageKey: { type: String, default: '' },
          uploadedAt: { type: Date, default: null },
          uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
          deletedAt: { type: Date, default: null },
          deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        },
        authorization: {
          fileName: { type: String, default: '' },
          originalName: { type: String, default: '' },
          mimeType: { type: String, default: '' },
          size: { type: Number, default: 0 },
          storageKey: { type: String, default: '' },
          uploadedAt: { type: Date, default: null },
          uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
          deletedAt: { type: Date, default: null },
          deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        },
      },
    },
  },
  { timestamps: true },
);

academySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Academy', academySchema);
