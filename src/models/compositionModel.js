import mongoose from "mongoose";

const compositionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    layout: { type: mongoose.Schema.Types.ObjectId, ref: "layouts" },
    content: {},
    duration: { type: Number },
    referenceUrl: [{ type: String }],
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Composition = mongoose.model("compositions", compositionSchema);

export { Composition };
