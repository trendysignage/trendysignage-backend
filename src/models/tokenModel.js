import mongoose from "mongoose";
import { TOKEN_TYPE, USER_TYPE, DEVICE_TYPE } from "../config/appConstants.js";

const tokenSchema = new mongoose.Schema(
  {
    token: { type: String, unique: true, required: true },
    vendor: { type: mongoose.SchemaTypes.ObjectId, ref: "vendors" },
    admin: { type: mongoose.SchemaTypes.ObjectId, ref: "admins" },
    otp: {},
    role: {
      type: String,
      enum: [...Object.values(USER_TYPE)],
      required: true,
    },
    type: {
      type: String,
      enum: [...Object.values(TOKEN_TYPE)],
      required: true,
    },
    expires: { type: Date, required: true },
    device: {
      type: { type: String, enum: [...Object.values(DEVICE_TYPE)] },
      token: { type: String },
    },
    isDeleted: { type: Boolean, default: false, required: true },
    blacklisted: {
      type: Boolean,
      default: false,
      required: true,
    },
    isVerified: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model("token", tokenSchema);

export { Token };
