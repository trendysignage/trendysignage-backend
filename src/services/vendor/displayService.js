import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor } from "../../models/vendorModel.js";
import { AuthFailedError } from "../../utils/errors.js";

export const getScreens = async (search, vendorId) => {
  let vendor = await Vendor.findOne(vendorId).lean().select("screens");
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (search) {
    vendor.screens = vendor.screens.filter((i) =>
      JSON.stringify(i.name.toLowerCase()).includes(search.toLowerCase())
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
    {
      /* _id: vendorId  */
    },
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
    {
      /* _id: vendorId  */
      "screens._id": body.screenId,
    },
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
  const vendor = await Vendor.findOneAndUpdate(
    {
      /* _id: vendorId  */ "screens._id": screenId,
    },
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
