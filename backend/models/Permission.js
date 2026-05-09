const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true },
    module: { type: String, required: true },
    description: { type: String, default: '' },
    allowedRoles: [{ type: String }],
    defaultEmployeeTypes: [{ type: String }],
    isSensitive: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

permissionSchema.index({ module: 1, isActive: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
