import mongoose from 'mongoose';

const demoRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  academyName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  sportType: { type: String, required: true },
  message: { type: String },
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now },
});

demoRequestSchema.index({ createdAt: -1 });
demoRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('DemoRequest', demoRequestSchema);
