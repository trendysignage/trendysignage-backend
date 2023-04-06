import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/vendorModel.js";
import { AuthFailedError } from "../../utils/errors.js";

export const addScreen = async (vendorId, body) => {
  let screen = [
    {
      name: body.name,
      screenLocation: body.screenLocation,
      googleLocation: body.googleLocation,
      tags: body.tags,
    },
  ];
  const vendor = await Vendor.findOneAndUpdate(
    { _id: vendorId },
    { $addToSet: { screens: screen } },
    { new: 1, lean: 1 }
  );
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};
