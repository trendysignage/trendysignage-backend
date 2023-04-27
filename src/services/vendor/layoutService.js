import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import {
  Vendor,
  Screen,
  Device,
  Layout,
  Composition,
} from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { emit } from "../socketService.js";

export const layouts = async () => {
  const layouts = await Layout.find({ isDeleted: false }).lean();
  return layouts;
};

export const addLayout = async (vendorId, body) => {
  let data = {
    title: body.title,
    screenType: body.screenType,
    screenResolution: body.screenResolution,
    zones: body.zones,
  };
  const layout = await Layout.create(data);
  if (!layout) {
    throw new AuthFailedError(
      ERROR_MESSAGES.LAYOUT_FAILED,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const editLayout = async (vendorId, body) => {
  let data = {
    title: body.title,
    screenType: body.screenType,
    screenResolution: body.screenResolution,
    zones: body.zones,
  };
  const layout = await Layout.findOne({
    _id: body.layoutId,
    isDeleted: false,
  });
  if (!layout) {
    throw new AuthFailedError(
      ERROR_MESSAGES.LAYOUT_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (!layout.createdBy || JSON.stringify(layout.createdBy) !== vendorId) {
    throw new AuthFailedError(
      ERROR_MESSAGES.UNAUTHORIZED,
      STATUS_CODES.ACTION_FAILED
    );
  }
  await Layout.updateOne(
    { _id: body.layoutId, isDeleted: false },
    { $set: data },
    { new: 1, lean: 1 }
  );
};

export const deleteLayout = async (vendorId, layoutId) => {
  const layout = await Layout.findOne({
    _id: layoutId,
    isDeleted: false,
  }).lean();
  if (!layout) {
    throw new AuthFailedError(
      ERROR_MESSAGES.LAYOUT_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (!layout.createdBy || JSON.stringify(layout.createdBy) !== vendorId) {
    throw new AuthFailedError(
      ERROR_MESSAGES.UNAUTHORIZED,
      STATUS_CODES.ACTION_FAILED
    );
  }
  await Layout.updateOne(
    { _id: layoutId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: 1, lean: 1 }
  );
};

export const getComposition = async (vendorId, query) => {
  let compositions = await Composition.find({
    createdBy: vendorId,
    isDeleted: false,
  })
    .lean()
    .populate({ path: "layout" })
    .skip(query.page * query.limit)
    .limit(query.limit);
  if (query.search) {
    compositions = compositions.filter((c) =>
      JSON.stringify(c.name.toLowerCase()).includes(query.search.toLowerCase())
    );
  }
  return compositions;
};

export const addComposition = async (vendorId, body) => {
  const data = {
    name: body.name,
    layout: body.layoutId,
    createdBy: vendorId,
    zones: body.zones,
    duration: body.duration,
    referenceUrl: body.referenceUrl,
  };
  const composition = await Composition.create(data);
  if (!composition) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
  await Vendor.updateOne(
    { _id: vendorId },
    { $addToSet: { compositions: composition._id } },
    { new: 1, lean: 1 }
  );
};
