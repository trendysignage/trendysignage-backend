import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor, Screen, Device } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { emit } from "../socketService.js";
import path from "path";

export const deviceCode = async (vendorId, code) => {
  if (
    !(await Device.findOne({
      deviceCode: code,
      isDeleted: false,
      isVerified: false,
    }))
  ) {
    throw new AuthFailedError(
      ERROR_MESSAGES.WRONG_DEVICE_CODE,
      STATUS_CODES.ACTION_FAILED
    );
  }
  await Device.findOneAndUpdate(
    { deviceCode: code, isDeleted: false },
    { $set: { vendor: vendorId } },
    { new: true, lean: 1 }
  );
};

export const getScreens = async (query, vendorId) => {
  let screens = await Screen.find({
    vendor: vendorId,
    isDeleted: false,
  })
    .lean()
    .populate({ path: "device" })
    .sort({ createdAt: -1 });
  // .skip(query.page * query.limit)
  // .limit(query.limit);
  if (query.search) {
    screens = screens.filter((i) =>
      JSON.stringify(i.name.toLowerCase()).includes(query.search.toLowerCase())
    );
  }
  return screens;
};

export const addScreen = async (vendorId, body) => {
  let device = await Device.findOne({
    deviceCode: body.code,
    isDeleted: false,
    isVerified: false,
  }).lean();
  if (!device) {
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
    deviceCode: body.code,
    vendor: vendorId,
    device: device._id,
  });
  device = await Device.findOneAndUpdate(
    { deviceCode: body.code, isDeleted: false },
    { $set: { isVerified: true, screen: screen._id } },
    { new: true, lean: true }
  );
  let vendor = await Vendor.findOneAndUpdate(
    { _id: vendorId, isDeleted: false },
    { $addToSet: { screens: screen._id } },
    { new: true, lean: 1 }
  );
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  vendor.defaultComposition.isDefault = true;
  await emit(device.deviceToken, vendor.defaultComposition);
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
      vendor: vendorId,
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
      vendor: vendorId,
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
  let device = await Device.findOneAndUpdate(
    { screen: screenId, isDeleted: false },
    {
      $set: { isVerified: false },
      $unset: { screen: "", vendor: "" },
    },
    { new: true, lean: 1 }
  );
  await Vendor.findByIdAndUpdate(vendorId, { $pull: { screens: screen._id } });
  await emit(device.deviceToken, "", "delete");
};

export const getScreen = async (screenId) => {
  const screen = await Screen.findOne({
    _id: screenId,
    isDeleted: false,
  })
    .lean()
    .populate({ path: "device" });
  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCREEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return screen;
};

export const getMedia = async (query, vendorId) => {
  let vendor = await Vendor.findById(vendorId)
    .lean()
    .select("media")
    .populate({
      path: "media.createdBy",
      select: ["_id", "name"],
      options: { skip: query.page * query.limit, limit: query.limit },
    });
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (query.type) {
    vendor.media = vendor.media.filter((i) => i.type == query.type);
  }
  if (query?.search) {
    vendor.media = vendor.media.filter((i) =>
      JSON.stringify(i.title.toLowerCase()).includes(query.search.toLowerCase())
    );
  }
  // vendor.host = host;
  return vendor;
};

export const addMedia = async (vendorId, body, file) => {
  let media = [
    {
      title: file.path.substring("public".length),
      type: body.type,
      properties: body.properties,
      tags: body.tags,
      createdBy: vendorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      isDeleted: false,
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

export const editMedia = async (vendorId, body, file) => {
  let data = {
    "media.$.properties": body.properties,
    "media.$.tags": body.tags,
    "media.$.updatedAt": new Date(),
  };
  if (file) {
    data["media.$.title"] = file.path.substring("public".length);
  }
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      "media._id": body.mediaId,
    },
    {
      $set: data,
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
  let vendor = await Vendor.findOne({
    _id: vendorId,
    "media._id": mediaId,
  }).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  vendor.media = vendor.media.filter(
    (id) => JSON.stringify(id._id) === JSON.stringify(mediaId)
  );
  console.log(vendor.media, "medd");
  if (vendor.media[0].isDefault) {
    throw new AuthFailedError(
      ERROR_MESSAGES.DEFAULT_MEDIA,
      STATUS_CODES.ACTION_FAILED
    );
  }
  vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      "media._id": mediaId,
    },
    {
      $pull: { media: { _id: mediaId } },
    },
    { new: true, lean: 1 }
  );
};

export const publish = async (vendorId, body) => {
  let vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
  }).lean();
  // .populate({ path: "compositions" });
  let content;

  if (body.type === "media") {
    vendor.media = vendor.media.filter(
      (id) => JSON.stringify(id._id) === JSON.stringify(body.id)
    );
    content = {
      media: vendor.media[0],
      duration: body.duration,
      startTime: new Date(),
      type: "media",
      endTime: new Date(),
      createdAt: new Date(),
    };
  } else {
    vendor.compositions = vendor.compositions.filter(
      (id) => JSON.stringify(id) === JSON.stringify(body.id)
    );
    content = {
      media: vendor.compositions[0],
      duration: body.duration,
      type: "composition",
      startTime: new Date(),
      endTime: new Date(),
      createdAt: new Date(),
    };
  }
  content.endTime.setMinutes(content.startTime.getMinutes() + body.duration);
  for (const id of body.screenIds) {
    const screen = await Screen.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { contentPlaying: content } },
      { new: true, lean: 1 }
    )
      .lean()
      .populate({ path: "device" });
    if (!screen) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCREEN_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
    await emit(screen.device?.deviceToken, content);
  }
};

export const mediaFile = async (filePath) => {
  filePath = "public/" + filePath;
  const file = path.resolve(filePath);
  if (!file) {
    throw new Error("File not found");
  }
  return file;
};
