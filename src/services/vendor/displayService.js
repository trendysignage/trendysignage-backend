import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor, Screen, Device } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const getScreens = async (search, vendorId) => {
  let screens = await Screen.find({
    vendor: vendorId,
    isDeleted: false,
  }).lean();
  if (search) {
    screens = screens.filter((i) =>
      JSON.stringify(i.name.toLowerCase()).includes(search.toLowerCase())
    );
  }
  return screens;
};

export const addScreen = async (vendorId, body) => {
  if (!(await Device.findOne({ deviceCode: body.code, isDeleted: false }))) {
    throw new AuthFailedError(
      ERROR_MESSAGES.WRONG_DEVICE_CODE,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const screen = await Screen.create({
    name: body.name,
    screenLocation: body.screenLocation,
    googleLocation: body.googleLocation,
    tags: body.tags,
    groups: body.groups,
    vendor: vendorId,
  });
  await Device.findOneAndUpdate(
    { deviceCode: body.code, isDeleted: false },
    { $set: { isVerified: true, screen: screen._id, vendor: vendorId } },
    { new: true, lean: 1 }
  );
};

export const editScreen = async (vendorId, body) => {
  let data = {
    name: body.name,
    screenLocation: body.screenLocation,
    googleLocation: body.googleLocation,
    tags: body.tags,
    groups: body.groups,
  };
  const screen = await Screen.findOneAndUpdate(
    {
      _id: body.screenId,
      isDeleted: false,
    },
    { $set: data },
    { new: true, lean: 1 }
  );
  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCREEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const deleteScreen = async (vendorId, screenId) => {
  const screen = await Screen.findOneAndUpdate(
    {
      _id: screenId,
      isDeleted: false,
    },
    {
      $set: { isDeleted: true },
    },
    { new: true, lean: 1 }
  );
  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const getMedia = async (search, vendorId) => {
  let vendor = await Vendor.findOne(vendorId).lean().select("media");
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (search) {
    vendor.media = vendor.media.filter((i) =>
      JSON.stringify(i.title.toLowerCase()).includes(search.toLowerCase())
    );
  }
  return vendor;
};

export const addMedia = async (vendorId, body) => {
  let media = [
    {
      title: body.title,
      timestamp: new Date(),
      properties: body.properties,
      tags: body.tags,
    },
  ];
  const vendor = await Vendor.findOneAndUpdate(
    {
      /* _id: vendorId */
    },
    { $addToSet: { media: media } },
    { new: true, lean: 1 }
  );
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const editMedia = async (vendorId, body) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      /* _id: vendorId */
      "media._id": body.mediaId,
    },
    {
      $set: {
        "media.$.title": body.title,
        "media.$.properties": body.properties,
        "media.$.tags": body.tags,
      },
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

export const deleteMedia = async (vendorId, mediaId) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      /* _id: vendorId  */ "media._id": mediaId,
    },
    {
      $pull: { media: { _id: mediaId } },
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
