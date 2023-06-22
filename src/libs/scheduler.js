import cron from "node-cron";
import { STATUS_CODES } from "../config/appConstants.js";
import { Device, Schedule, Screen } from "../models/index.js";
import { emit } from "../services/socketService.js";
import { AuthFailedError } from "../utils/errors.js";

const task = async (req, res) => {
  try {
    const screens = await Screen.find({
      isDeleted: false,
      schedule: { $exists: true },
    }).lean();

    for (const s of screens) {
      let schedule = await Schedule.findOne(
        {
          _id: s.schedule,
          "sequence.dates": { $in: [new Date().toISOString().split("T")[0]] },
          "sequence.timings": {
            $elemMatch: {
              startTime: { $lte: new Date() },
              endTime: { $gte: new Date() },
            },
          },
        },
        {
          sequence: {
            $elemMatch: {
              dates: { $in: [new Date().toISOString().split("T")[0]] },
              timings: {
                $elemMatch: {
                  startTime: { $lte: new Date() },
                  endTime: { $gte: new Date() },
                },
              },
            },
          },
        }
      )
        .populate({ path: "sequence.timings.composition" })
        .lean();

      let device = await Device.findOne({
        _id: s.device,
        isDeleted: false,
      }).lean();

      if (schedule) {
        console.log("schedulleeee runninggggggggggg");
        schedule.sequence.map(async (seq) => {
          content = {
            media: seq?.timings[0]?.composition,
            duration: body.duration,
            type: "composition",
            startTime: seq?.timings[0]?.startTime,
            endTime: seq?.timings[0]?.endTime,
            createdAt: new Date(),
          };
          console.log("emitting.......");
          await emit(device.deviceToken, schedule.sequence);
        });
      }
    }
  } catch (err) {
    console.log(err, "errrrr");
    throw new AuthFailedError(err, STATUS_CODES.ACTION_FAILED);
  }
};

cron.schedule("*/2 * * * * *", task);

export default cron;
