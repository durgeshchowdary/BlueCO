import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: { type: String, default: 'system' },
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', default: null },
    action: { type: String, required: true },
    targetType: { type: String, default: '' },
    targetId: { type: String, default: '' },
    metadata: { type: Object, default: {} },
    ip: { type: String, default: '' },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ academyId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
