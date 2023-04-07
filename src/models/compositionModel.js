import mongoose from "mongoose";

const compositionSchema = new mongoose.Schema(
  {
    title: { type: String },
    layout: { type: String },
    tags: [{ type: String }],
    media: [
      {
        title: { type: String },
        duration: { type: Number },
        priority: { type: Number },
      },
    ],
    isDefault: { type: Boolean, default: false, required: true },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const Composition = mongoose.model("compositions", compositionSchema);

export { Composition };
