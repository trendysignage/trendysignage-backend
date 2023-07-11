import mongoose from "mongoose";

const quickplaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "screens" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    composition: { type: mongoose.Schema.Types.ObjectId, ref: "compositions" },
    duration: { type: Number, default: 600 },
    tags: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Quickplay = mongoose.model("quickplays", quickplaySchema);

export { Quickplay };
