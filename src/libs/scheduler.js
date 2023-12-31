import moment from "moment-timezone";
import cron from "node-cron";
import { STATUS_CODES } from "../config/appConstants.js";
import { Composition, Device, Schedule, Screen } from "../models/index.js";
import { emit } from "../services/socketService.js";
import { AuthFailedError } from "../utils/errors.js";
import { formatScheduleTime, utcTime } from "../utils/formatResponse.js";

const checkContent = (a, b) => {
  return (
    JSON.stringify(a.media) == JSON.stringify(b.media) &&
    JSON.stringify(a.duration) == JSON.stringify(b.duration) &&
    JSON.stringify(a.startTime) == JSON.stringify(b.startTime) &&
    JSON.stringify(a.endTime) == JSON.stringify(b.endTime)
  );
};

const task = async (req, res) => {
  try {
    const timezone = req?.headers?.timezone ?? "Asia/Kolkata";

    const [screens, defaultComp] = await Promise.all([
      Screen.find({
        isDeleted: false,
        schedule: { $exists: true },
      }).lean(),
      Composition.findOne({
        name: "Default Composition",
        isDefault: true,
      }).lean(),
    ]);

    const currentTime = moment.tz(new Date(), timezone);
    const currentDate = moment.tz(timezone).format("YYYY-MM-DD");

    for (const s of screens) {
      let [schedule, device] = await Promise.all([
        Schedule.findOne(
          {
            _id: s.schedule,
            "sequence.dates": {
              $in: [new Date(currentDate)],
            },
          },
          { "sequence.$": 1 }
        )
          .populate({ path: "sequence.timings.composition" })
          .lean(),
        Device.findOne({
          _id: s.device,
          isDeleted: false,
        }).lean(),
      ]);

      if (schedule) {
        schedule.sequence[0].timings = schedule.sequence[0].timings.filter(
          (item) =>
            moment(currentTime).isBetween(
              moment.tz(
                `${currentDate} ${item.startTime.toISOString().split("T")[1]}`,
                "YYYY-MM-DD HH:mm",
                timezone
              ),
              moment.tz(
                `${currentDate} ${item.endTime.toISOString().split("T")[1]}`,
                "YYYY-MM-DD HH:mm",
                timezone
              )
            )
        );
        schedule.sequence = schedule.sequence.filter(
          (item) => item.timings.length > 0
        );
      }

      if (schedule && schedule.sequence.length > 0) {
        let diffMiliSeconds = Math.abs(
          schedule?.sequence[0]?.timings[0]?.startTime -
            schedule?.sequence[0]?.timings[0]?.endTime
        );
        let diffSeconds = Math.floor(diffMiliSeconds / 1000);

        const composition = await Composition.findById({
          _id: schedule?.sequence[0]?.timings[0]?.composition?._id,
        }).lean();

        let content = {
          scheduleId: schedule?._id,
          media: composition ?? defaultComp,
          duration: diffSeconds,
          type: "composition",
          startTime: formatScheduleTime(
            currentDate,
            schedule?.sequence[0]?.timings[0]?.startTime,
            timezone
          ),
          endTime: formatScheduleTime(
            currentDate,
            schedule?.sequence[0]?.timings[0]?.endTime,
            timezone
          ),
          createdAt: utcTime(new Date(), timezone),
        };

        if (!s.contentPlaying.some((item) => checkContent(item, content))) {
          console.log("========emitting scheduler========");
          emit(device.deviceToken, content);
          await Screen.findOneAndUpdate(
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

cron.schedule("*/5 * * * * *", task);

export default cron;
