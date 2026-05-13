import mongoose from 'mongoose';

const automationLogSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true, default: null },
    jobName: { type: String, required: true, index: true },
    jobKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed', 'skipped'],
      default: 'queued',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null },
    errorMessage: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

automationLogSchema.index({ jobName: 1, status: 1, createdAt: -1 });
automationLogSchema.index({ academyId: 1, jobName: 1, createdAt: -1 });

export default mongoose.model('AutomationLog', automationLogSchema);
