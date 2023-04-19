import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor, Screen, Device } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const defaultComposition = async (vendorId, body) => {
  let media = {
    title: body.title,
    type: body.type,
  };
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      isDeleted: false,
    },
    { $set: { defaultComposition: { media, duration: body.duration } } },
    { new: true, lean: 1 }
  ).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  console.log(vendor);
};
