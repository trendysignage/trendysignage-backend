import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { App, Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const getApps = async (vendor) => {
  const apps = await Vendor.find({ isDeleted: false, vendor }).lean();
  return apps;
};

export const createApp = async (vendor, body) => {
  const media = {
    title: body.name,
    type: body.type,
    appData: body.data,
    createdBy: vendor,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const vendor = await Vendor.findOneAndUpdate(
    { _id: vendor },
    { $addToSet: { media } },
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

export const editApp = async (vendor, body) => {
  const app = await App.findOneAndUpdate(
    {
      vendor,
      isDeleted: false,
      _id: body.appId,
    },
    {
      $set: {
        name: body.name,
        type: body.type,
        data: body.data,
        url: body.url,
        tags: body.tags,
      },
    },
    { new: 1, lean: 1 }
  );

  if (!app) {
    throw new AuthFailedError(
      ERROR_MESSAGES.APP_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};
