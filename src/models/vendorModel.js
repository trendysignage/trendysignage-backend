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
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    userGroups: [{ type: mongoose.Schema.Types.ObjectId }],
    role: { type: String, default: ROLE.ADMIN },
    roles: ROLES_SCHEMA,
    totalScreens: { type: Number, default: 1 },
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
