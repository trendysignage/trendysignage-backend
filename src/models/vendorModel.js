import mongoose from "mongoose";
import { MEDIA_TYPE } from "../config/appConstants.js";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
    },
    socialId: {
      googleId: { type: String },
    },
    password: { type: String },
    defaultComposition: {
      media: {
        title: { type: String },
        type: { type: String /* enum: [...Object.values(MEDIA_TYPE)]  */ },
      },
      duration: { type: Number },
    },
    media: [
      {
        // baseUrl: { type: String },
        title: { type: String },
        type: { type: String /* enum: [...Object.values(MEDIA_TYPE)]  */ },
        properties: { type: String },
        tags: [{ type: String }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
        createdAt: { type: Date, default: new Date() },
        updatedAt: { type: Date, default: new Date() },
        isDefault: { type: Boolean, default: false },
        // startTime: { type: Date },
        // endTime: { type: Date },
      },
    ],
    apps: [{ type: mongoose.Schema.Types.ObjectId, ref: "apps" }],
    compositions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "compositions" },
    ],
    schedules: [{ type: mongoose.Schema.Types.ObjectId, ref: "schedules" }],
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "screens" }],
    country: { type: String },
    countryCode: { type: Number },
    phoneNumber: { type: Number },
    isOnline: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("vendors", vendorSchema);

export { Vendor };
