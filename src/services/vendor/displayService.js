import path from "path";
import {
  CONTENT_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} from "../../config/appConstants.js";
import { Composition, Device, Screen, Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { localtime } from "../../utils/formatResponse.js";
import { paginationOptions } from "../../utils/universalFunction.js";
import { emit } from "../socketService.js";

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
  let data = { vendor: vendorId, isDeleted: false };

  if (query.search) {
    let searchReg = RegExp(query.search, "i");
    data = { ...data, name: { $regex: searchReg } };
  }
  if (query.status) {
    if (query.status === "live") {
      data = { ...data, isConnected: true };
    } else if (query.status === "offline") {
      data = { ...data, isConnected: false };
    } else {
      data = { ...data, isDeleted: true };
    }
  }
  if (query.tags) {
    data = { ...data, tags: { $in: query.tags } };
  }
  if (query.groups) {
    data = { ...data, groups: { $in: query.groups } };
  }

  let screens = await Screen.find(
    data,
    {},
    paginationOptions(query.page, query.limit)
  )
    .sort({ createdAt: -1 })
    .populate([{ path: "device" }, { path: "schedule" }]);

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
    { $set: { isVerified: true, screen: screen._id, vendor: vendorId } },
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
    .populate([{ path: "device" }, { path: "schedule" }]);
  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCREEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return screen;
};

export const changeDefaultComposition = async (vendorId, body) => {
  const composition = await Composition.findOne({
    _id: body.compositionId,
    isDeleted: false,
  }).lean();

  if (!composition) {
    throw new AuthFailedError(
      ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  const defaultComposition = {
    media: composition,
    duration: body.duration,
    type: "composition",
  };

  defaultComposition.media.isDefault = true;

  const screen = await Screen.findOneAndUpdate(
    {
      _id: body.screenId,
      isDeleted: false,
    },
    { $set: { defaultComposition } }
  )
    .lean()
    .populate({ path: "device" });

  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCREEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  if (screen.device) {
    await emit(screen.device?.deviceToken, screen.defaultComposition);
  }
};

export const getMedia = async (query, vendorId) => {
  let vendor;
  if (!query.type) {
    let data = { _id: vendorId, isDeleted: false };
    let projection = { media: 1 };
    if (query.search) {
      let searchReg = RegExp(query.search, "i");
      data = { ...data, "media.title": { $regex: searchReg } };
    }
    if (query.filterType) {
      data = { ...data, "media.type": { $eq: query.filterType } };
      projection = { "media.$": 1 };
    }
    if (query.tags) {
      data = { ...data, "media.tags": { $in: query.tags } };
      projection = { "media.$": 1 };
    }

    vendor = await Vendor.findOne(data, projection)
      .lean()
      .populate({
        path: "media.createdBy",
        select: ["_id", "name"],
      });

    if (!vendor) {
      vendor = {
        _id: vendorId,
        media: [],
      };
    }

    vendor.media = vendor?.media?.sort((a, b) => b.createdAt - a.createdAt);
    vendor.media = vendor?.media?.slice(query.page * query.limit, query.limit);
  } else {
    let data = { _id: vendorId, isDeleted: false };

    vendor = await Vendor.findOne(data)
      .lean()
      .select("media")
      .populate({
        path: "media.createdBy",
        select: ["_id", "name"],
      });

    if (!vendor) {
      throw new AuthFailedError(
        ERROR_MESSAGES.VENDOR_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }

    vendor.media = vendor.media.sort((a, b) => b.createdAt - a.createdAt);
    vendor.media = vendor.media.filter((i) => i.type === query.type);
    if (query.search) {
      vendor.media = vendor.media.filter((i) =>
        JSON.stringify(i.title).includes(query.search)
      );
    }
    vendor.media = vendor.media.slice(query.page * query.limit, query.limit);
  }

  return vendor;
};

export const addMedia = async (vendorId, body, file) => {
  let title;
  if (body.name) {
    title = body.name + "_" + Date.now() + path.extname(file.originalname);
  } else {
    title = file.path.substring("public".length);
  }
  console.log(title, "title of media", body);
  let media = [
    {
      title,
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
  vendor.media = vendor.media.find(
    (id) => JSON.stringify(id._id) === JSON.stringify(mediaId)
  );
  if (vendor.media.isDefault) {
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

export const publish = async (vendorId, body, timezone) => {
  let vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
  })
    .lean()
    .populate({ path: "compositions" });

  let contentPlaying;

  if (body.type === CONTENT_TYPE.MEDIA) {
    vendor.media = vendor.media.find(
      (id) => JSON.stringify(id._id) === JSON.stringify(body.id)
    );
    if (!vendor.media) {
      throw new AuthFailedError(
        ERROR_MESSAGES.WRONG_TYPE_OR_ID,
        STATUS_CODES.ACTION_FAILED
      );
    }
    contentPlaying = {
      media: vendor.media,
      duration: body.duration,
      type: "media",
      startTime: new Date(localtime(new Date(), timezone) + "Z"),
      endTime: new Date(localtime(new Date(), timezone) + "Z"),
      createdAt: new Date(localtime(new Date(), timezone) + "Z"),
    };
  } else {
    vendor.compositions = vendor.compositions.find(
      (id) => JSON.stringify(id._id) === JSON.stringify(body.id)
    );
    if (!vendor.compositions) {
      throw new AuthFailedError(
        ERROR_MESSAGES.WRONG_TYPE_OR_ID,
        STATUS_CODES.ACTION_FAILED
      );
    }
    contentPlaying = {
      media: vendor.compositions,
      duration: body.duration,
      type: "composition",
      startTime: new Date(localtime(new Date(), timezone) + "Z"),
      endTime: new Date(localtime(new Date(), timezone) + "Z"),
      createdAt: new Date(localtime(new Date(), timezone) + "Z"),
    };
  }

  contentPlaying.endTime.setSeconds(
    contentPlaying.startTime.getSeconds() + body.duration
  );

  for (const id of body.screenIds) {
    let screen = await Screen.findOne({ _id: id, isDeleted: false }).populate({
      path: "device",
    });

    if (body.type === CONTENT_TYPE.MEDIA) {
      const index = screen.contentPlaying.findIndex(
        (item) => item.type === CONTENT_TYPE.MEDIA
      );
      if (index !== -1) {
        screen.contentPlaying.splice(index, 1);
      }
    }

    screen.contentPlaying.push(contentPlaying);
    screen = await screen.save();
    // const screen = await Screen.findOneAndUpdate(
    //   { _id: id, isDeleted: false },
    //   { $push: { contentPlaying: contentPlaying } },
    //   { new: true, lean: 1 }
    // )
    //   .lean()
    //   .populate({ path: "device" });

    if (!screen) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCREEN_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
    await emit(screen.device?.deviceToken, contentPlaying, "", body.type);
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
