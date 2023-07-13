import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "vendors" },
    sequence: [
      {
        name: { type: String, required: true },
        timings: [
          {
            composition: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "compositions",
            },
            startTime: { type: Date },
            endTime: { type: Date },
          },
        ],
        dates: [{ type: Date }],
      },
    ],
    tags: [{ String }],
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "screens" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("schedules", scheduleSchema);

export { Schedule };
