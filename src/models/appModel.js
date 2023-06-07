import mongoose from "mongoose";

const appSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    data: {},
    url: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const App = mongoose.model("apps", appSchema);

export { App };
