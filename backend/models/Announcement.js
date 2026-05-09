const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, default: 'All (Students + Employees)' },
    type: { type: String, default: 'General' },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    read: { type: Boolean, default: false },
    time: { type: String, default: 'Just now' },
    inApp: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

announcementSchema.virtual('id').get(function getId() {
  return this._id.toString();
});

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ academyId: 1, createdAt: -1 });
announcementSchema.index({ read: 1, priority: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
