import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true },
  name: { type: String, required: true },
  sport: { type: String, required: true },
  phone: { type: String, required: true },
  salary: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
});

coachSchema.index({ name: 1 });
coachSchema.index({ academyId: 1, status: 1 });
coachSchema.index({ status: 1 });

export default mongoose.model('Coach', coachSchema);
