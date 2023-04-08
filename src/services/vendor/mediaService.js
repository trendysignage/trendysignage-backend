import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/vendorModel.js";
import { AuthFailedError } from "../../utils/errors.js";

export const addMedia = async (vendorId, body) => {
  const vendor = await Vendor.findByIdAndUpdate(vendorId);
};
