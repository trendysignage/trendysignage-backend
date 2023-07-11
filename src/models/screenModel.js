import mongoose from "mongoose";
import { SUBSCRIPTION_STATUS } from "../config/appConstants.js";
import { localtime } from "../utils/formatResponse.js";

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    screenLocation: { type: String, required: true },
    googleLocation: { type: String },
    tags: [{ type: String }],
    defaultComposition: {
      media: {},
      duration: { type: Number },
      type: { type: String },
    },
    contentPlaying: [
      {
        media: {},
        // type: { type: String },
        duration: { type: Number },
        startTime: { type: Date, default: new Date() },
        endTime: { type: Date },
        type: { type: String },
        createdAt: { type: Date, default: new Date() },
      },
    ],
    groups: [{ type: mongoose.Schema.Types.ObjectId }],
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "schedules" },
    deviceCode: { type: String, required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: "devices" },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    subscription: {
      amount: { type: Number },
      status: {
        type: String,
        enum: [...Object.values(SUBSCRIPTION_STATUS)],
        default: SUBSCRIPTION_STATUS.ACTIVE,
      },
    },
    uptimeReport: [
      {
        day: { type: String },
        time: { type: Number, default: 0 },
      },
    ],
    connectionStartTime: { type: Date },
    isConnected: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

screenSchema.methods.startUptimeTracking = async function (timezone) {
  if (!this.isConnected) {
    this.connectionStartTime = localtime(new Date(), timezone);
    this.isConnected = true;
  }
  return this.save();
};

screenSchema.methods.stopUptimeTracking = async function (timezone) {
  if (this.connectionStartTime) {
    const now = new Date(localtime(new Date(), timezone));
    const today = localtime(new Date(), timezone).split("T")[0]; // Get today's date in YYYY-MM-DD format
    const uptimeMinutes = Math.round(
      (now - this.connectionStartTime) / (1000 * 60)
    ); // Calculate uptime in minutes

    // Find the uptime report entry for today, if it exists
    const todayReport = this.uptimeReport.find(
      (report) => report.day === today
    );

    if (todayReport) {
      // If an entry exists for today, update the uptime time
      todayReport.time += uptimeMinutes;
    } else {
      // If no entry exists for today, create a new entry
      this.uptimeReport.push({
        day: today,
        time: uptimeMinutes,
      });
    }
    this.isConnected = false;
    this.connectionStartTime = null; // Reset the connection start time
    // Save the updated screen document
    return this.save();
  }
};

const Screen = mongoose.model("screens", screenSchema);

export { Screen };
