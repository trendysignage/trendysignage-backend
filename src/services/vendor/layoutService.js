import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Composition, Layout, Screen, Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { paginationOptions } from "../../utils/universalFunction.js";

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

export const getCompositions = async (vendorId, query) => {
  let data = { createdBy: vendorId, isDeleted: false };

  if (query.search) {
    let searchReg = RegExp(query.search, "i");
    data = { ...data, name: { $regex: searchReg } };
  }
  if (query.tags) {
    data = { ...data, tags: { $in: query.tags } };
  }

  let compositions = await Composition.find(
    data,
    {},
    paginationOptions(query.page, query.limit)
  ).populate({ path: "layout" });

  return compositions;
};

export const getComposition = async (compositionId) => {
  const composition = await Composition.findOne({
    _id: compositionId,
    isDeleted: false,
  })
    .lean()
    .populate([{ path: "layout" }, { path: "createdBy" }]);

  if (!composition) {
    throw new AuthFailedError(
      ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return composition;
};

export const addComposition = async (vendorId, body) => {
  const data = {
    name: body.name,
    layout: body.layoutId,
    createdBy: vendorId,
    zones: body.zones,
    duration: body.duration,
    referenceUrl: body.referenceUrl,
    tags: body.tags,
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

export const editComposition = async (vendorId, body) => {
  const data = {
    name: body.name,
    createdBy: vendorId,
    zones: body.zones,
    duration: body.duration,
    referenceUrl: body.referenceUrl,
  };
  const composition = await Composition.findOneAndUpdate(
    {
      _id: body.compositionId,
      isDeleted: false,
    },
    { $set: data },
    { new: 1, lean: 1 }
  );
  if (!composition) {
    throw new AuthFailedError(
      ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const screen = await Screen.find({
    vendor: vendorId,
    contentPlaying: { $elemMatch: { "media._id": composition._id } },
  }).lean();

  let contentPlaying = {
    media: composition,
    duration: body.duration,
    type: "composition",
    startTime: new Date(localtime(new Date(), timezone) + "Z"),
    endTime: new Date(localtime(new Date(), timezone) + "Z"),
    createdAt: new Date(localtime(new Date(), timezone) + "Z"),
  };
};

export const deleteComposition = async (vendorId, compositionId) => {
  const composition = await Composition.findOneAndUpdate(
    { _id: compositionId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: 1, lean: 1 }
  );
  if (!composition) {
    throw new AuthFailedError(
      ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  await Vendor.updateOne(
    { _id: vendorId },
    { $pull: { compositions: composition._id } },
    { new: 1, lean: 1 }
  );
};

async function check() {
  const screen = await Screen.find({
    isDeleted: false,
  }).lean();

  const data = screen.find((s) =>
    JSON.stringify(s.contentPlaying).includes("64d0a1b9a6a5a29ff860f6e3")
  );
  console.log(data);
}

check();
