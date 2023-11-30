import Parser from "rss-parser";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const createApp = async (vendor, body) => {
  const parser = new Parser();

  const subvendor = await Vendor.findById(vendor).lean();
  if (!subvendor.roles[subvendor.role]["APPS"].add) {
    throw new AuthFailedError(
      ERROR_MESSAGES.PERMISSION_DENIED,
      STATUS_CODES.FORBIDDEN
    );
  }

  const media = {
    title: body.name,
    type: body.type,
    appData: body.data,
    createdBy: vendor,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (subvendor.vendor) media.createdBy = subvendor.vendor;

  if (body.type === "youtube-apps") {
    media.duration = 0;
  }

  const app = await Vendor.findOneAndUpdate(
    { _id: media.createdBy },
    { $addToSet: { media } },
    { new: 1, lean: 1 }
  );

  if (!app) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  if (body.type === "rss-apps") {
    app.media[app.media.length - 1].appData = JSON.parse(
      app.media[app.media.length - 1]?.appData
    );
    if (app.media[app.media.length - 1].appData.urlLink) {
      app.media[app.media.length - 1].appData.urlLink = await parser.parseURL(
        app.media[app.media.length - 1]?.appData?.urlLink
      );
    }
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
