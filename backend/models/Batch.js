const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  coachName: { type: String, required: true },
  timing: { type: String, required: true },
  capacity: { type: Number, required: true },
});

batchSchema.index({ name: 1 });
batchSchema.index({ sport: 1 });

module.exports = mongoose.model('Batch', batchSchema);
