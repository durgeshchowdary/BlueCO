const mongoose = require('mongoose');

const academySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    city: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial'],
      default: 'trial',
    },
    ownerName: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    featureFlags: [{ type: String }],
  },
  { timestamps: true },
);

academySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Academy', academySchema);
