import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/vendorModel.js";
import { AuthFailedError } from "../../utils/errors.js";
import { Device } from "../../models/index.js";

export const addDevice = async (deviceToken, code) => {
  const device = await Device.findOneAndUpdate(
    {
      deviceToken: deviceToken,
      isDeleted: false,
      isVerified: true,
    },
    { $set: { deviceToken: deviceToken, deviceCode: code } },
    { upsert: true, new: true, lean: 1 }
  );
  return device;
};
