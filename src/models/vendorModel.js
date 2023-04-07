import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    password: { type: String, required: true },
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
    country: { type: String },
    countryCode: { type: Number, required: true },
    phoneNumber: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("vendors", vendorSchema);

export { Vendor };
