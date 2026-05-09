const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Event', eventSchema);
