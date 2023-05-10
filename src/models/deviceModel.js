import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    deviceToken: { type: String, required: true },
    deviceCode: { type: String, unique: true, required: true },
    deviceOS: { type: String },
    privateIP: { type: String },
    publicIP: { type: String },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "screens" },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Device = mongoose.model("devices", deviceSchema);

export { Device };
