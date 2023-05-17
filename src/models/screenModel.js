import mongoose from "mongoose";
import { SUBSCRIPTION_STATUS } from "../config/appConstants.js";

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
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "schedules" },
    deviceCode: { type: String, required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: "devices" },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    subscription: {
      amount: { type: Number },
      status: {
        type: String,
        enum: [...Object.values(SUBSCRIPTION_STATUS)],
        default: SUBSCRIPTION_STATUS.PENDING,
      },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Screen = mongoose.model("screens", screenSchema);

export { Screen };
