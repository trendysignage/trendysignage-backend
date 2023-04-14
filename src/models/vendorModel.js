import mongoose from "mongoose";
import { MEDIA_TYPE } from "../config/appConstants.js";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String },
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
    media: [
      {
        title: { type: String },
        type: { type: String, enum: [...Object.values(MEDIA_TYPE)] },
        uploadDate: { type: Date },
        properties: { type: String },
        tags: [{ type: String }],
      },
    ],
    apps: [{ type: mongoose.Schema.Types.ObjectId, ref: "apps" }],
    compositions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "compositions" },
    ],
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
