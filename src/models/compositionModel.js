import mongoose from "mongoose";

const compositionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    layout: { type: mongoose.Schema.Types.ObjectId, ref: "layouts" },
    zones: [
      {
        name: { type: String }, //zone1, xyz
        zoneId: { type: String },
        content: [
          {
            url: { type: String },
            type: { type: String },
            maintainAspectRatio: { type: Boolean, default: false },
            fitToScreen: { type: Boolean, default: true },
            crop: { type: Boolean, default: false },
            croppedImage: { type: String },
            duration: { type: Number },
          },
        ],
      },
    ],
    tags: [{ type: String }],
    duration: { type: Number },
    schedules: [{ type: mongoose.Schema.Types.ObjectId, ref: "schedules" }],
    referenceUrl: [{ type: String }],
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Composition = mongoose.model("compositions", compositionSchema);

export { Composition };
