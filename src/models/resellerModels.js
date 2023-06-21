import mongoose from "mongoose";
import { MEDIA_TYPE } from "../config/appConstants.js";

const resellerSchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "vendors" }],
    comission: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Reseller = mongoose.model("resellers", resellerSchema);

export { Reseller };
