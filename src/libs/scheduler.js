import cron from "node-cron";
import { Device, Schedule, Screen } from "../models/index.js";
import { emit } from "../services/socketService.js";

const task = async () => {
  const screens = await Screen.find({
    isDeleted: false,
    schedule: { $exists: true },
  }).lean();
  for (const s of screens) {
    let schedule = await Schedule.findOne({ _id: s.schedule }).lean();
    let device = await Device.findOne({
      _id: s.device,
      isDeleted: false,
    }).lean();

    schedule.sequence = schedule.sequence.filter(
      (seq) => seq.endTime > new Date() && seq.startTime < new Date()
    );

    if (schedule.sequence.length) {
      await emit(device.deviceToken, schedule.sequence);
    }
  }
};

cron.schedule("*/2 * * * * *", task);

export default cron;
