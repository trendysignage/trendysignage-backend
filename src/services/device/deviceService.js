import {
  CONTENT_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} from "../../config/appConstants.js";
import { Vendor, Device, Screen, Composition } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const addDevice = async (deviceToken, code) => {
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
      screen = await Screen.findOne(
        { _id: device.screen, isDeleted: false }
        /* { $pull: { contentPlaying: { endTime: { $lt: new Date() } } } },
        { new: true, lean: 1 } */
      );
      if (!screen) {
        throw new AuthFailedError(
          ERROR_MESSAGES.SCREEN_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }
    }
    device.content = screen.contentPlaying ? screen.contentPlaying : [];
    device.composition = [];
    if (screen.contentPlaying[0].type === CONTENT_TYPE.COMPOSITION) {
      const composition = await Composition.findById(
        screen.contentPlaying[0].media
      ).lean();
      device.composition = screen.contentPlaying;
      // device.composition.length
      //   ? (device.composition[0].media = composition)
      //   : (device.composition = []);
    }
    console.log("device content =====[=???", screen.contentPlaying);
  }
  return device;
};
