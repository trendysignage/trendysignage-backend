import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const getVendor = async (_id) => {
  const vendor = await Vendor.findOne({ _id, isDeleted: false }).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return vendor;
};

export const deleteVendor = async (_id) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id,
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: 1, lean: 1 }
  );
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return vendor;
};

export const list = async (query) => {
  const vendors = await Vendor.find({ isDeleted: false }).lean();
  return vendors;
};
