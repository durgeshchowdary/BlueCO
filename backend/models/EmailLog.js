import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true, default: null },
    to: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true },
    template: { type: String, required: true, index: true },
    status: { type: String, enum: ['queued', 'sent', 'failed', 'skipped'], default: 'queued', index: true },
    provider: { type: String, default: 'mock' },
    attempts: { type: Number, default: 0 },
    errorMessage: { type: String, default: '' },
    sentAt: { type: Date, default: null },
    dedupeKey: { type: String, default: '', index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

emailLogSchema.index({ academyId: 1, status: 1, createdAt: -1 });

export default mongoose.model('EmailLog', emailLogSchema);
