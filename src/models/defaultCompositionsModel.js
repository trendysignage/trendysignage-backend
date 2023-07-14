import mongoose from "mongoose";

const defaultCompSchema = new mongoose.Schema(
  {
    composition: { type: mongoose.Schema.Types.ObjectId, ref: "compositions" },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "screens" }],
    tags: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Defaults = mongoose.model("defaults", defaultCompSchema);

export { Defaults };
