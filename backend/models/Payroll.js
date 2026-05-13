import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', default: null, index: true },
    employeeName: { type: String, required: true },
    month: { type: String, required: true, index: true },
    baseSalary: { type: Number, required: true },
    lateMarks: { type: Number, default: 0 },
    halfDayDeductions: { type: Number, default: 0 },
    absentDeductions: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'approved', 'frozen', 'paid'],
      default: 'draft',
      index: true,
    },
    approvedAt: { type: Date, default: null },
    frozenAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

payrollSchema.index({ academyId: 1, month: 1, employeeName: 1 }, { unique: true });

export default mongoose.model('Payroll', payrollSchema);
