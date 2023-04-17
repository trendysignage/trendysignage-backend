import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/vendorModel.js";
import { AuthFailedError } from "../../utils/errors.js";
import { Device } from "../../models/index.js";

export const addDevice = async (deviceToken, code) => {
  let device = await Device.findOne({
    deviceToken: deviceToken,
    isDeleted: false,
  }).lean();
  if (!device) {
    device = await Device.create({
      deviceToken: deviceToken,
      deviceCode: code,
    });
  }
  return device;
};

export const getContent = async (deviceId) => {
  const device = await Device.findOne({
    _id: deviceId,
    isDeleted: false,
  }).lean();
  if (!device) {
    throw new AuthFailedError(
      ERROR_MESSAGES.DEVICE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const screen = await Screen.findOne({
    device: deviceId,
    isDeleted: false,
  }).lean();
  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCREEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  let content = screen.contentPlaying ? screen.contentPlaying : [];
  return content;
};
