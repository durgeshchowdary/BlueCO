import mongoose from "mongoose";

const videoAnalysisSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      default: "",
    },
    sport: {
      type: String,
      default: "Football",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed"],
      default: "queued",
    },
    aiScore: {
      type: Number,
      default: 0,
    },
    insights: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("VideoAnalysis", videoAnalysisSchema);
