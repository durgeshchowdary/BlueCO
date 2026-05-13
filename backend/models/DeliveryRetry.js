import mongoose from 'mongoose';

const deliveryRetrySchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true, default: null },
    channel: { type: String, enum: ['email', 'whatsapp'], required: true, index: true },
    logId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    dedupeKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed', 'dead_letter'],
      default: 'queued',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 4 },
    nextRunAt: { type: Date, default: Date.now, index: true },
    lastError: { type: String, default: '' },
    providerCode: { type: String, default: '', index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

deliveryRetrySchema.index({ status: 1, nextRunAt: 1 });
deliveryRetrySchema.index({ academyId: 1, status: 1, createdAt: -1 });

export default mongoose.model('DeliveryRetry', deliveryRetrySchema);
