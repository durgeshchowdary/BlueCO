import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true },
  studentName: { type: String, default: '' },
  employeeName: { type: String, default: '' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', default: null, index: true },
  actorType: { type: String, enum: ['student', 'employee', 'coach'], default: 'student', index: true },
  sport: { type: String, default: '' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'present', 'absent', 'leave', 'late'], required: true },
  notes: { type: String, default: '' },
});

attendanceSchema.index({ date: -1 });
attendanceSchema.index({ academyId: 1, date: -1 });
attendanceSchema.index({ status: 1, date: -1 });

export default mongoose.model('Attendance', attendanceSchema);
