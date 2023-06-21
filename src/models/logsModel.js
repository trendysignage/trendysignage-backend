import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    title: { type: String },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Logs = mongoose.model("logs", logSchema);

export { Logs };
