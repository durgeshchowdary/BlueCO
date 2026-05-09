const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  sport: { type: String, required: true },
  batch: { type: String, required: true },
  phone: { type: String, required: true },
  parentName: { type: String, required: true },
  monthlyFee: { type: Number, required: true },
  feeStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  joinedAt: { type: Date, default: Date.now },
});

studentSchema.index({ joinedAt: -1 });
studentSchema.index({ feeStatus: 1, joinedAt: -1 });
studentSchema.index({ sport: 1 });
studentSchema.index({ batch: 1 });

module.exports = mongoose.model('Student', studentSchema);
