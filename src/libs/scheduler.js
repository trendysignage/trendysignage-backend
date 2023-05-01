import cron from "node-cron";
import { Schedule, Screen } from "../models/index.js";

const task = async () => {
  const screens = await Screen.find({
    isDeleted: false,
    schedule: { $exists: true },
  }).lean();
  for (const s of screens) {
    let schedule = await Schedule.findOne({ _id: s.schedule }).lean();
    schedule.sequence = schedule.sequence.filter(
      (seq) => seq.endTime > new Date()
    );
  }
};

cron.schedule("*/2 * * * * *", task);

export default cron;
