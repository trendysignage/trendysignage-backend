const mongoose = require("mongoose");

const appSchema = new mongoose.Schema(
  {
    name: { type: String },
    meta: {},
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

module.exports = App = mongoose.model("apps", appSchema);
