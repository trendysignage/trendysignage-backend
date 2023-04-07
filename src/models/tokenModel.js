const mongoose = require("mongoose");
const {
  USER_TYPE,
  TOKEN_TYPE,
  DEVICE_TYPE,
} = require("../config/appConstants");

const tokenSchema = mongoose.Schema(
  {
    token: { type: String, unique: true, required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "admins" },
    otp: { code: { type: Number }, expiresAt: { type: Date } },
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

module.exports = Token;
