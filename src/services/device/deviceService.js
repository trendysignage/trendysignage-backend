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
  if (!device.isVerified) {
    device = await Device.findOneAndUpdate(
      {
        deviceToken: deviceToken,
        isDeleted: false,
      },
      { $set: { deviceCode: code } },
      { new: true, lean: 1 }
    ).lean();
  }
  return device;
};
