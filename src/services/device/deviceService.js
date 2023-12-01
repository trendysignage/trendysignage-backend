import Parser from "rss-parser";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Device, Layout, Screen } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { localtime } from "../../utils/formatResponse.js";

export const addDevice = async (deviceToken, code, timezone) => {
  const parser = new Parser();
  let screen;

  let device = await Device.findOneAndUpdate(
    {
      deviceToken: deviceToken,
      isDeleted: false,
    },
    { $set: { isReload: false } }
  )
    .populate({ path: "vendor", select: ["defaultComposition"] })
    .lean();

  if (!device) {
    device = await Device.create({
      deviceToken: deviceToken,
      deviceCode: code,
    });
  } else {
    if (device.vendor) {
      device.defaultComposition = device?.vendor?.defaultComposition;
    }
    device.content = [];

    if (device.screen) {
      screen = await Screen.findOneAndUpdate(
        { _id: device.screen, isDeleted: false },
        {
          $pull: {
            contentPlaying: {
              endTime: {
                $lte: new Date(localtime(new Date(), timezone) + "Z"),
              },
            },
          },
        },
        { new: true, lean: 1 }
      );
      if (!screen) {
        throw new AuthFailedError(
          ERROR_MESSAGES.SCREEN_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }

      for (const content of screen.contentPlaying) {
        const layout1 = await Layout.findOne({
          _id: content?.media?.layout,
        }).lean();

        if (layout1) {
          content.media.layout = layout1;
        }
      }

      if (screen.defaultComposition) {
        device.defaultComposition = screen?.defaultComposition;
      }

      const layout2 = await Layout.findOne({
        _id: device?.defaultComposition?.media?.layout,
      }).lean();
      if (layout2) {
        device.defaultComposition.media.layout = layout2;
      }

      device.content = screen?.contentPlaying ?? [];
    }

    for (const content of device?.content) {
      if (content && content?.media && content.media.zones) {
        for (const zone of content?.media?.zones) {
          if (zone && zone?.content) {
            for (const s of zone?.content) {
              if (s?.type === "rss-apps") {
                s.data = JSON.parse(s?.data);
                if (s.data.urlLink) {
                  parser
                    .parseURL(s?.data?.urlLink)
                    .then((v) => (s.data.urlLink = v))
                    .catch((err) => {
                      throw new AuthFailedError(
                        ERROR_MESSAGES.RSS_APP_FAILED,
                        STATUS_CODES.ACTION_FAILED
                      );
                    });
                }
              }
            }
          }
        }
      }
    }

    if (
      device.defaultComposition &&
      device.defaultComposition.media &&
      device.defaultComposition.media.zones
    ) {
      for (const zone of device.defaultComposition?.media?.zones) {
        if (zone && zone?.content) {
          for (const s of zone?.content) {
            if (s?.type === "rss-apps") {
              s.data = JSON.parse(s?.data);
              if (s.data.urlLink) {
                parser
                  .parseURL(s?.data?.urlLink)
                  .then((v) => (s.data.urlLink = v))
                  .catch((err) => {
                    throw new AuthFailedError(
                      ERROR_MESSAGES.RSS_APP_FAILED,
                      STATUS_CODES.ACTION_FAILED
                    );
                  });
              }
            }
          }
        }
      }
    }

    delete device.vendor;
    return device;
  }
};

export const addDevice1 = async (deviceToken, code, timezone) => {
  let screen;
  const parser = new Parser();

  let device = await Device.findOneAndUpdate(
    {
      deviceToken: deviceToken,
      isDeleted: false,
    },
    { $set: { isReload: false } }
  )
    .lean()
    .populate({ path: "vendor" });

  if (!device) {
    device = await Device.create({
      deviceToken: deviceToken,
      deviceCode: code,
    });
  } else {
    if (device.vendor) {
      device.defaultComposition = device?.vendor?.defaultComposition;
    }
    if (device.screen) {
      screen = await Screen.findOneAndUpdate(
        { _id: device.screen, isDeleted: false },
        {
          $pull: {
            contentPlaying: {
              endTime: {
                $lte: new Date(localtime(new Date(), timezone) + "Z"),
              },
            },
          },
        },
        { new: true, lean: 1 }
      );

      if (!screen) {
        throw new AuthFailedError(
          ERROR_MESSAGES.SCREEN_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }
      if (screen.defaultComposition) {
        device.defaultComposition = screen?.defaultComposition;
      }
    }

    // device.content = [];
    device.composition = [];

    if (screen && screen.contentPlaying) {
      for (const item of screen.contentPlaying) {
        device.composition.push(item);
      }
    }

    for (const content of device?.composition) {
      if (content && content.media && content.media.zones) {
        for (const zone of content?.media?.zones) {
          for (const s of zone?.content) {
            if (s?.type === "rss-apps") {
              s.rssData = JSON.parse(s?.data);
              if (s?.rssData?.urlLink) {
                parser
                  .parseURL(s?.rssData?.urlLink)
                  .then((v) => (s.rssData.urlLink = v))
                  .catch(() => {
                    throw new AuthFailedError(
                      ERROR_MESSAGES.RSS_APP_FAILED,
                      STATUS_CODES.ACTION_FAILED
                    );
                  });
              }
            }
          }
        }
      }
    }

    if (
      device.defaultComposition &&
      device.defaultComposition.media &&
      device.defaultComposition.media.zones
    ) {
      for (const zone of device.defaultComposition?.media?.zones) {
        if (zone && zone?.content) {
          for (const s of zone?.content) {
            if (s?.type === "rss-apps") {
              s.rssData = JSON.parse(s?.data);
              parser
                .parseURL(s?.rssData?.urlLink)
                .then((v) => (s.rssData.urlLink = v))
                .catch(() => {
                  throw new AuthFailedError(
                    ERROR_MESSAGES.RSS_APP_FAILED,
                    STATUS_CODES.ACTION_FAILED
                  );
                });
            }
          }
        }
      }
    }
  }

  delete device.vendor;
  return device;
};

// export const addDev = async (deviceToken, code, timezone) => {
//   let screen;

//   let device = await Device.findOneAndUpdate(
//     {
//       deviceToken: deviceToken,
//       isDeleted: false,
//     },
//     { $set: { isReload: false } }
//   ).lean();

//   if (!device) {
//     device = await Device.create({
//       deviceToken: deviceToken,
//       deviceCode: code,
//     });
//   } else {
//     if (device.screen) {
//       // screen = await Screen.findOne({ _id: device.screen, isDeleted: false });y
//       screen = await Screen.findOneAndUpdate(
//         { _id: device.screen, isDeleted: false },
//         { $pull: { contentPlaying: { endTime: { $lt: new Date() } } } },
//         { new: true, lean: 1 }
//       );

//       if (!screen) {
//         throw new AuthFailedError(
//           ERROR_MESSAGES.SCREEN_NOT_FOUND,
//           STATUS_CODES.ACTION_FAILED
//         );
//       }
//     }
//     device.content = screen?.contentPlaying ?? [];
//   }
//   return device;
// };
