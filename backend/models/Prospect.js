import mongoose from "mongoose";

const prospectSchema = new mongoose.Schema(
  {
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Academy",
      default: null,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "" },
    parent: { type: String, default: "" },
    ageGroup: { type: String, default: "" },
    sport: { type: String, default: "Football" },
    source: { type: String, default: "Direct" },
    interest: { type: String, default: "" },
    notes: { type: String, default: "" },
    stage: {
      type: String,
      enum: ["Inquiry", "Trial", "Evaluation", "Fee Negotiation", "Enrolled"],
      default: "Inquiry",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Prospect", prospectSchema);
