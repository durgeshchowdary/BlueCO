import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    sendTo: { type: String, default: "All" },
    inApp: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    priority: { type: String, default: "Info" },
    type: { type: String, default: "Manual Announcement" },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
