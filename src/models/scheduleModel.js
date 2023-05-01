import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    sequence: [
      {
        name: { type: String, required: true },
        date: { type: String },
        startTime: { type: Date },
        endTime: { type: Date },
        composition: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "compositions",
        },
      },
    ],
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "screens" }],
    duration: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("schedules", scheduleSchema);

export { Schedule };
