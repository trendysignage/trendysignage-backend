import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    screenLocation: { type: String, required: true },
    googleLocation: { type: String },
    tags: [{ type: String }],
    defaultComposition: {
      media: {},
      duration: { type: String },
    },
    contentPlaying: [
      {
        media: {},
        // type: { type: String },
        duration: { type: Number },
        startTime: { type: Date, default: new Date() },
        endTime: { type: Date },
        createdAt: { type: Date, default: new Date() },
      },
    ],
    groups: [{ type: String }],
    deviceCode: { type: String, required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: "devices" },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Screen = mongoose.model("screens", screenSchema);

export { Screen };
