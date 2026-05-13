import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true },
  name: { type: String, required: true },
  sport: { type: String, required: true },
  coachName: { type: String, required: true },
  timing: { type: String, required: true },
  capacity: { type: Number, required: true },
});

batchSchema.index({ name: 1 });
batchSchema.index({ academyId: 1, name: 1 });
batchSchema.index({ sport: 1 });

export default mongoose.model('Batch', batchSchema);
