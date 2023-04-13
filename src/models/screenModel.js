import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    screenLocation: { type: String, required: true },
    googleLocation: { type: String },
    tags: [{ type: String }],
    defaultComposition: { type: String },
    schedule: {
      startTime: { type: Date },
      endTime: { type: Date },
    },
    groups: [{ type: String }],
    deviceCode: { type: String, required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Screen = mongoose.model("screens", screenSchema);

export { Screen };
