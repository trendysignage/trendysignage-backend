import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: { type: String },
    logo: {
      title: { type: String },
      type: { type: String },
      coordinates: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
      dimensions: {
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
      },
      orientation: { type: String },
    },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    screenHealthIndicator: { type: Boolean, default: false },
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "screens" }],
    isDeleted: { type: Boolean, defualt: false },
  },
  { timestamps: true }
);

const Profile = mongoose.model("profiles", profileSchema);

export { Profile };
