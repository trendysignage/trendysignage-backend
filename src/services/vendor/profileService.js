import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor, Screen, Device } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const defaultComposition = async (vendorId, mediaId) => {
  let media = {
    title: file.path.substring("public".length),
    type: "image",
    duration: "10 sec",
  };
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      isDeleted: false,
    },
    { $set: { defaultComposition: media } },
    { new: true, lean: 1 }
  ).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};
