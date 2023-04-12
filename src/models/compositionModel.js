import mongoose from "mongoose";

const compositionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    layout: { type: String, required: true },
    tags: [{ type: String }],
    media: [
      {
        title: { type: String },
        duration: { type: Number },
        priority: { type: Number },
        zone: { type: Number },
      },
    ],
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Composition = mongoose.model("compositions", compositionSchema);

export { Composition };
