import mongoose from "mongoose";
import { ROLE, ROLES_SCHEMA } from "../config/appConstants.js";

const vendorSchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String, required: true },
    profilePic: { type: String },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    socialId: {
      googleId: { type: String },
    },
    password: { type: String },
    defaultComposition: {
      media: {},
      type: { type: String },
      duration: { type: Number, default: 0 },
    },
    media: [
      {
        title: { type: String },
        type: { type: String },
        properties: { type: String },
        tags: [{ type: String }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
        createdAt: { type: Date, default: new Date() },
        updatedAt: { type: Date, default: new Date() },
        isDefault: { type: Boolean, default: false },
        duration: { type: Number, default: 1 },
        appData: { type: String },
        // startTime: { type: Date },
        // endTime: { type: Date },
      },
    ],
    mediaReport: [
      {
        media: { type: mongoose.Schema.Types.ObjectId },
        title: { type: String },
        day: { type: String },
        time: { type: Date },
        loop: { type: Number },
        duration: { type: Number },
      },
    ],
    apps: [{ type: mongoose.Schema.Types.ObjectId, ref: "apps" }],
    compositions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "compositions" },
    ],
    schedules: [{ type: mongoose.Schema.Types.ObjectId, ref: "schedules" }],
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "screens" }],
    subscription: {
      totalAmount: { type: Number },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    groups: [
      {
        name: { type: String },
        description: { type: String },
      },
    ],
    mfa: { type: String },
    mfaEnabled: { type: Boolean, default: false },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    userGroups: [{ type: mongoose.Schema.Types.ObjectId }],
    role: { type: String, default: ROLE.ADMIN },
    roles: ROLES_SCHEMA,
    totalScreens: { type: Number, default: 1 },
    duration: { type: Number, default: 1 }, //duration time limit for vendor in months
    country: { type: String },
    countryCode: { type: Number },
    phoneNumber: { type: Number },
    isEnabled: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("vendors", vendorSchema);

export { Vendor };
