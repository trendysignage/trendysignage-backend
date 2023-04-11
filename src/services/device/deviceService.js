import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/vendorModel.js";
import { AuthFailedError } from "../../utils/errors.js";
import { Device } from "../../models/index.js";

export const addDevice = async (deviceToken, code) => {
  let device = await Device.findOneAndUpdate(
    {
      deviceToken: deviceToken,
      isDeleted: false,
      isVerified: true,
      screen: { $exists: false },
      vendor: { $exists: false },
    },
    { $set: { deviceToken: deviceToken, deviceCode: code } },
    { upsert: true, new: true, lean: 1 }
  );
  if (!device) {
    device = await Device.findOne({
      deviceToken: deviceToken,
      isDeleted: false,
    }).lean();
  }
  return device;
};
