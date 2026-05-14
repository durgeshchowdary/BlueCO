import mongoose from 'mongoose';
import { ROLES, EMPLOYEE_TYPES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },

    portalType: {
      type: String,
      enum: ['super-admin', 'academy', 'employee', 'student'],
      required: true,
    },

    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Academy',
      default: null,
    },

    employeeType: {
      type: String,
      enum: [...Object.values(EMPLOYEE_TYPES), null],
      default: null,
    },

    permissions: [{ type: String }],

    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],

    assignedBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1, academyId: 1 });
userSchema.index({ academyId: 1, isActive: 1 });
userSchema.index({ portalType: 1 });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);