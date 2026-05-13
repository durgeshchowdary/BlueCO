import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    dueAt: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ academyId: 1, assignedTo: 1, status: 1 });

export default mongoose.model('Task', taskSchema);
