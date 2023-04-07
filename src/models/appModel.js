import mongoose from "mongoose";

const appSchema = new mongoose.Schema(
  {
    name: { type: String },
    meta: {},
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const App = mongoose.model("apps", appSchema);

export { App };
