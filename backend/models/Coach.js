const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  phone: { type: String, required: true },
  salary: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
});

coachSchema.index({ name: 1 });
coachSchema.index({ status: 1 });

module.exports = mongoose.model('Coach', coachSchema);
