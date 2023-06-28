import cron from "node-cron";
import { STATUS_CODES } from "../config/appConstants.js";
import { Device, Schedule, Screen } from "../models/index.js";
import { emit } from "../services/socketService.js";
import { AuthFailedError } from "../utils/errors.js";
import { localtime, utcTime } from "../utils/formatResponse.js";

const checkContent = (a, b) => {
  return (
    a.media === b.media &&
    a.duration === b.duration &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime
  );
};

const task = async (req, res) => {
  try {
    const timezone = req?.headers?.timezone ?? "Asia/Kolkata";
    const screens = await Screen.find({
      isDeleted: false,
      schedule: { $exists: true },
    }).lean();

    const currentTime = new Date(localtime(new Date(), timezone) + "Z");

    for (const s of screens) {
      let schedule = await Schedule.findOne(
        {
          _id: s.schedule,
          "sequence.dates": { $in: [new Date().toISOString().split("T")[0]] },
          "sequence.timings": {
            $elemMatch: {
              startTime: { $lte: currentTime },
              endTime: { $gte: currentTime },
            },
          },
        },
        { "sequence.timings.$": 1 }
      )
        .populate({ path: "sequence.timings.composition" })
        .lean();

      let device = await Device.findOne({
        _id: s.device,
        isDeleted: false,
      }).lean();

      if (schedule) {
        let diffMiliSeconds = Math.abs(
          schedule?.sequence[0]?.timings[0]?.startTime -
            schedule?.sequence[0]?.timings[0]?.endTime
        );
        let diffSeconds = Math.floor(diffMiliSeconds / 1000);

        let content = {
          media: schedule?.sequence[0]?.timings[0]?.composition,
          duration: diffSeconds,
          type: "composition",
          startTime: schedule?.sequence[0]?.timings[0]?.startTime,
          endTime: schedule?.sequence[0]?.timings[0]?.endTime,
          createdAt: utcTime(new Date(), timezone),
        };

        console.log(
          !s.contentPlaying.some((item) => checkContent(item, content)),
          "iss working??"
        );

        if (!s.contentPlaying.some((item) => checkContent(item, content))) {
          console.log("emitting.......");
          await emit(device.deviceToken, content);
          await Screen.updateOne(
            {
              _id: s._id,
            },
            { $push: { contentPlaying: content } },
            { new: 1, lean: 1 }
          );
        }
      }
    }
  } catch (err) {
    console.log(err, "errrrr");
    throw new AuthFailedError(err, STATUS_CODES.ACTION_FAILED);
  }
};

// cron.schedule("*/1 * * * *", task);

export default cron;
