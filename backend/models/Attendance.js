const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  sport: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
});

attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
