import mongoose from "mongoose";

const layoutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    screenType: { type: String, required: true }, //landscape, potrait
    screenResolution: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    zones: [
      {
        name: { type: String, required: true },
        x: { type: Number, required: true, default: 0 },
        y: { type: Number, required: true, default: 0 },
        height: { type: Number, required: true, default: 480 },
        width: { type: Number, required: true, default: 270 },
        content: {},
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Layout = mongoose.model("layouts", layoutSchema);

export { Layout };
