const { ERROR_MESSAGES, STATUS_CODES } = require("../../config/appConstants");
const { Vendor } = require("../../models");
const { AuthFailedError } = require("../../utils/errors");

exports.addScreen = async (vendorId, body) => {
  const vendor = await Vendor.findOneAndUpdate(
    { _id: vendorId },
    {},
    { new: 1, lean: 1 }
  );
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};
