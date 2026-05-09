const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', index: true },
    subject: { type: String, required: true },
    requester: { type: String, default: 'Admin User' },
    category: { type: String, default: 'general' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ticketSchema.virtual('id').get(function getId() {
  return this._id.toString();
});

ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ academyId: 1, createdAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
