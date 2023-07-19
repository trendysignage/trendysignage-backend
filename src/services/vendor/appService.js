import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { App } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const getApps = async (vendor) => {
  const apps = await App.find({ isDeleted: false, vendor }).lean();
  return apps;
};

export const createApp = async (vendor, body) => {
  const app = await App.create({
    name: body.name,
    type: body.type,
    data: body.data,
    url: body.url,
    vendor,
  });

  return app;
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
