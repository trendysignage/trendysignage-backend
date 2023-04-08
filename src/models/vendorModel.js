import mongoose from "mongoose";

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
      facebookId: { type: String },
      appleId: { type: String },
    },
    password: { type: String },
    screens: [
      {
        name: { type: String },
        screenLocation: { type: String },
        googleLocation: { type: String },
        tags: [{ type: String }],
        defaultComposition: { type: String },
        schedule: {
          startTime: { type: Date },
          endTime: { type: Date },
        },
        groups: { type: String },
        deviceCode: { type: Number },
      },
    ],
    media: [
      {
        title: { type: String },
        timestamp: { type: Date },
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
    isOnline: { type: Boolean, default: false, required: true },
    isDeleted: { type: Boolean, default: false, required: true },
    isVerified: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("vendors", vendorSchema);

export { Vendor };
