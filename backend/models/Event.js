const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true },
  title: { type: String, required: true },
  sport: { type: String, default: 'Multi-sport' },
  type: { type: String, default: 'Tournament' },
  date: { type: Date, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  location: { type: String, default: 'TBD' },
  venue: { type: String },
  maxParticipants: { type: Number, default: 0 },
  entryFee: { type: Number, default: 0 },
  description: { type: String, default: '' },
});

eventSchema.index({ date: 1 });
eventSchema.index({ academyId: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
