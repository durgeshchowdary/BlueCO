import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    role: { type: String, default: '' },
    category: {
      type: String,
      enum: ['billing', 'attendance', 'payroll', 'ai_insights', 'announcements', 'tickets', 'security', 'system'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    actionUrl: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
    readAt: { type: Date, default: null },
    dedupeKey: { type: String, default: '', index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

notificationSchema.index({ academyId: 1, userId: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ dedupeKey: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
