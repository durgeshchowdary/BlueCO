import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true, index: true },
    category: {
      type: String,
      enum: ['cost', 'utilization', 'coach_load', 'churn', 'attendance', 'revenue', 'billing', 'operations'],
      required: true,
      index: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
    title: { type: String, required: true },
    recommendation: { type: String, required: true },
    impact: { type: String, default: '' },
    confidence: { type: Number, min: 0, max: 1, default: 0.7 },
    status: { type: String, enum: ['open', 'acknowledged', 'resolved'], default: 'open', index: true },
    signals: { type: mongoose.Schema.Types.Mixed, default: {} },
    generatedAt: { type: Date, default: Date.now, index: true },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

aiInsightSchema.index({ academyId: 1, category: 1, status: 1, generatedAt: -1 });

export default mongoose.model('AIInsight', aiInsightSchema);
