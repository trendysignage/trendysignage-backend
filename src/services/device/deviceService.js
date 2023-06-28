import {
  CONTENT_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} from "../../config/appConstants.js";
import { Composition, Device, Schedule, Screen } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { localtime, utcTime } from "../../utils/formatResponse.js";

export const addDevice = async (deviceToken, code, timezone) => {
  let screen;

  let device = await Device.findOne({
    deviceToken: deviceToken,
    isDeleted: false,
  })
    .lean()
    .populate({ path: "vendor" });

  if (!device) {
    device = await Device.create({
      deviceToken: deviceToken,
      deviceCode: code,
    });
  } else {
    let content = [];
    if (device.screen) {
      // screen = await Screen.findOne({ _id: device.screen, isDeleted: false });
      screen = await Screen.findOneAndUpdate(
        { _id: device.screen, isDeleted: false },
        { $pull: { contentPlaying: { endTime: { $lt: new Date() } } } },
        { new: true, lean: 1 }
      );

      if (!screen) {
        throw new AuthFailedError(
          ERROR_MESSAGES.SCREEN_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }

      if (screen && screen.schedule) {
        const currentTime = new Date(localtime(new Date(), timezone) + "Z");

        let schedule = await Schedule.findOne(
          {
            _id: screen.schedule,
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

        if (schedule) {
          schedule?.sequence?.map(async (seq) => {
            let diffMiliSeconds = Math.abs(
              seq?.timings[0]?.startTime - seq?.timings[0]?.endTime
            );
            let diffSeconds = Math.floor(diffMiliSeconds / 1000);

            content = [
              {
                media: seq?.timings[0]?.composition,
                duration: diffSeconds,
                type: "composition",
                startTime: seq?.timings[0]?.startTime,
                endTime: seq?.timings[0]?.endTime,
                createdAt: utcTime(new Date(), timezone),
              },
            ];

            // if (device.content) {
            //   device.content.push(JSON.parse(JSON.stringify(content)));
            // } else {
            // }
          });
        }
      }
    }

    let screencontent = (screen && screen?.contentPlaying) ?? [];
    device.content =
      (content.length > 0
        ? JSON.parse(JSON.stringify(content))
        : screencontent) ?? [];
  }
  return device;
};

export const addDevice1 = async (deviceToken, code, timezone) => {
  let screen;

  let device = await Device.findOne({
    deviceToken: deviceToken,
    isDeleted: false,
  })
    .lean()
    .populate({ path: "vendor" });

  device.defaultComposition = device.vendor.defaultComposition.media.title;

  if (!device) {
    device = await Device.create({
      deviceToken: deviceToken,
      deviceCode: code,
    });
  } else {
    if (device.screen) {
      // screen = await Screen.findOne({
      //   _id: device.screen,
      //   isDeleted: false,
      // }).populate({ path: "schedule" });

      screen = await Screen.findOneAndUpdate(
        { _id: device.screen, isDeleted: false },
        { $pull: { contentPlaying: { endTime: { $lt: new Date() } } } },
        { new: true, lean: 1 }
      );

      if (!screen) {
        throw new AuthFailedError(
          ERROR_MESSAGES.SCREEN_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }
    }

    device.content = [];
    device.composition = [];

    if (screen && screen.contentPlaying) {
      for (const item of screen.contentPlaying) {
        if (item.type === CONTENT_TYPE.MEDIA) {
          device.content.push(item);
        } else {
          console.log(item, "contetntt PLayinyyy");
          const composition = await Composition.findById(
            item?.media._id
          ).lean();

          if (!composition) {
            throw new AuthFailedError(
              ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
              STATUS_CODES.ACTION_FAILED
            );
          }

          device.composition.push(item);
        }
      }
    }
  }

  console.log(JSON.stringify(device));
  delete device.vendor;
  return device;
};

export const addDev = async (deviceToken, code, timezone) => {
  let screen;

  let device = await Device.findOne({
    deviceToken: deviceToken,
    isDeleted: false,
  }).lean();

  if (!device) {
    device = await Device.create({
      deviceToken: deviceToken,
      deviceCode: code,
    });
  } else {
    if (device.screen) {
      // screen = await Screen.findOne({ _id: device.screen, isDeleted: false });y
      screen = await Screen.findOneAndUpdate(
        { _id: device.screen, isDeleted: false },
        { $pull: { contentPlaying: { endTime: { $lt: new Date() } } } },
        { new: true, lean: 1 }
      );

      if (!screen) {
        throw new AuthFailedError(
          ERROR_MESSAGES.SCREEN_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }
    }
    device.content = screen?.contentPlaying ?? [];
  }
  return device;
};
