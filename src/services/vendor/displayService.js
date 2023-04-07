import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/vendorModel.js";
import { AuthFailedError } from "../../utils/errors.js";

export const getScreens = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId).lean().select("screens");
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return vendor;
};

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

export const editScreen = async (vendorId, body) => {
  const vendor = await Vendor.findOneAndUpdate(
    { _id: vendorId, "screens._id": body.screenId },
    {
      $set: {
        "screens.$.name": body.name,
        "screens.$.screenLocation": body.screenLocation,
        "screens.$.googleLocation": body.googleLocation,
        "screens.$.tags": body.tags,
        "screens.$.groups": body.groups,
        "screens.$.defaultComposition": body.defaultComposition,
      },
    },
    { new: 1, lean: 1 }
  );
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const deleteScreen = async (vendorId, screenId) => {
  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    {
      $pull: { screens: { _id: screenId } },
    },
    { new: true, lean: 1 }
  );
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};
