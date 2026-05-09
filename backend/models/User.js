const mongoose = require('mongoose');
const { ROLES, EMPLOYEE_TYPES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', default: null },
    employeeType: {
      type: String,
      enum: [...Object.values(EMPLOYEE_TYPES), null],
      default: null,
    },
    permissions: [{ type: String }],
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, academyId: 1 });
userSchema.index({ academyId: 1, isActive: 1 });

module.exports = mongoose.model('User', userSchema);
