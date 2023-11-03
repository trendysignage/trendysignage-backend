import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const createApp = async (vendor, body) => {
  const media = {
    title: body.name,
    type: body.type,
    appData: body.data,
    createdBy: vendor,
    duration: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const app = await Vendor.findOneAndUpdate(
    { _id: vendor },
    { $addToSet: { media } },
    { new: 1, lean: 1 }
  );

  if (!app) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  return app.media[app.media.length - 1];
};

export const editApp = async (_id, body) => {
  const app = await Vendor.findOneAndUpdate(
    {
      _id,
      "media._id": body.appId,
    },
    {
      $set: {
        "media.$.title": body.name,
        "media.$.appData": body.data,
        "media.$.tags": body.tags,
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
