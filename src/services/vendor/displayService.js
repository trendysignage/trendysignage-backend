import fs from "fs";
import path from "path";
import util from "util";
import {
  CONTENT_TYPE,
  ERROR_MESSAGES,
  SCREEN_SETTINGS,
  STATUS_CODES,
} from "../../config/appConstants.js";
import {
  Composition,
  Device,
  Layout,
  Screen,
  Vendor,
} from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { localtime } from "../../utils/formatResponse.js";
import {
  netInterface,
  paginationOptions,
} from "../../utils/universalFunction.js";
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
  const vendor = await Vendor.findById(vendorId, {
    defaultComposition: 1,
    screens: 1,
    totalScreens: 1,
  }).lean();
  if (vendor.screens && vendor.screens?.length >= vendor.totalScreens) {
    throw new AuthFailedError(
      ERROR_MESSAGES.REACHED_SCREEN_LIMIT,
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
  console.log("runinngg on server also------>>>>>>");
  let data = { vendor: vendorId, isDeleted: false };
  let options = {};

  const subVendor = await Vendor.findById(vendorId, { vendor: 1 }).lean();

  if (subVendor.vendor) {
    data.vendor = subVendor.vendor;
  }
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
  if (query.page && query.limit) {
    options = paginationOptions(query.page, query.limit);
  }

  const [screens, vendor] = await Promise.all([
    Screen.find(data, {}, options)
      .sort({ createdAt: -1 })
      .populate([{ path: "device" }, { path: "schedule" }]),
    Vendor.findById(vendorId, {
      groups: 1,
      defaultComposition: 1,
    }).lean(),
  ]);

  screens.forEach((screen) => {
    if (vendor?.groups && vendor.groups.length > 0) {
      screen.groups = screen.groups.map((elem) => {
        const elemIdString = JSON.stringify(elem._id);
        const vendorGroupIds = vendor.groups.map((group) =>
          JSON.stringify(group._id)
        );

        if (vendorGroupIds.includes(elemIdString)) {
          return vendor.groups.find(
            (group) => JSON.stringify(group._id) === elemIdString
          );
        }

        return elem;
      });
    }
    if (!screen.defaultComposition) {
      screen.defaultComposition = vendor.defaultComposition;
    }
  });

  return screens;
};

export const addScreen = async (vendorId, body) => {
  let [device, vendor] = await Promise.all([
    Device.findOne({
      deviceCode: body.code,
      isDeleted: false,
      isVerified: false,
    }).lean(),
    Vendor.findById(vendorId, {
      defaultComposition: 1,
      screens: 1,
      totalScreens: 1,
      roles: 1,
      role: 1,
      vendor: 1,
    }).lean(),
  ]);
  if (!vendor.roles[vendor.role]["SCREEN"].add) {
    throw new AuthFailedError(
      ERROR_MESSAGES.PERMISSION_DENIED,
      STATUS_CODES.FORBIDDEN
    );
  }
  if (!device) {
    throw new AuthFailedError(
      ERROR_MESSAGES.WRONG_DEVICE_CODE,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const { mac, privateIp, publicIp, deviceOS } = await netInterface();

  let data = {
    name: body.name,
    screenLocation: body.screenLocation,
    googleLocation: body.googleLocation,
    tags: body.tags,
    deviceCode: body.code,
    vendor: vendorId,
    device: device._id,
    drivers: {
      mac,
      publicIp,
      privateIp,
      deviceOS,
    },
    isConnected: true,
  };
  if (vendor.vendor) data.vendor = vendor.vendor;

  const screen = await Screen.create(data);
  [device, vendor] = await Promise.all([
    Device.findOneAndUpdate(
      { deviceCode: body.code, isDeleted: false },
      { $set: { isVerified: true, screen: screen._id, vendor: data.vendor } },
      { new: true, lean: true }
    ),
    Vendor.findOneAndUpdate(
      { _id: data.vendor, isDeleted: false },
      { $addToSet: { screens: screen._id } },
      { new: true, lean: 1 }
    ),
  ]);
  vendor.defaultComposition.isDefault = true;
  emit(device.deviceToken, vendor.defaultComposition);
};

export const editScreen = async (vendorId, body) => {
  const vendor = await Vendor.findById(vendorId).lean();
  if (!vendor.roles[vendor.role]["SCREEN"].edit) {
    throw new AuthFailedError(
      ERROR_MESSAGES.PERMISSION_DENIED,
      STATUS_CODES.FORBIDDEN
    );
  }

  const data = {
    name: body.name,
    screenLocation: body.screenLocation,
    googleLocation: body.googleLocation,
    tags: body.tags,
    groups: body.groups,
  };
  const screen = await Screen.findOneAndUpdate(
    {
      _id: body.screenId,
      $or: [{ vendor: vendor.vendor }, { vendor: vendorId }],
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
  const vendor = await Vendor.findById(vendorId).lean();
  if (!vendor.roles[vendor.role]["SCREEN"].delete) {
    throw new AuthFailedError(
      ERROR_MESSAGES.PERMISSION_DENIED,
      STATUS_CODES.FORBIDDEN
    );
  }

  const screen = await Screen.findOneAndUpdate(
    {
      _id: screenId,
      $or: [{ vendor: vendorId }, { vendor: vendor.vendor }],
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
  let [device] = await Promise.all([
    Device.findOneAndUpdate(
      { screen: screenId, isDeleted: false },
      {
        $set: { isVerified: false },
        $unset: { screen: "", vendor: "" },
      },
      { new: true, lean: 1 }
    ),
    Vendor.findByIdAndUpdate(vendorId, {
      $pull: { screens: screen._id },
    }),
    Vendor.findByIdAndUpdate(vendor.vendor, {
      $pull: { screens: screen._id },
    }),
  ]);
  emit(device.deviceToken, "", "delete");
};

// used in vendor and superAdmin
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
    { $set: { defaultComposition } },
    { new: 1 }
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
    emit(screen.device?.deviceToken, screen.defaultComposition);
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

    if (query.tags)
      vendor.media = vendor.media.filter((item) =>
        item.tags.some((tag) => query?.tags?.includes(tag))
      );
    vendor.media = vendor?.media?.sort((a, b) => b.createdAt - a.createdAt);

    if (query.page && query.limit)
      vendor.media = vendor?.media?.slice(
        query.page * query.limit,
        query.limit
      );
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
    if (query.page && query.limit)
      vendor.media = vendor.media.slice(query.page * query.limit, query.limit);
  }

  return vendor;
};

export const addMedia = async (vendorId, body, file) => {
  let title;
  if (body.name) {
    title =
      body.name.replace(/\s/g, "") +
      "_" +
      Date.now() +
      path.extname(file.originalname);
  } else {
    title = file.path.substring("public".length);
  }

  let media = [
    {
      title,
      type: body.type,
      properties: body.properties,
      tags: body.tags,
      createdBy: vendorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      duration: body.duration,
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

export const addMedia64 = async (vendorId, body, string) => {
  try {
    const base64String = string;
    const binaryData = Buffer.from(base64String, "base64");
    const filename = `${Date.now().toString()}.${body.extension}`;
    const Path = `public/${vendorId}`;
    const filePath = `public/${vendorId}/${filename}`;
    const mkdir = util.promisify(fs.mkdir);
    const writeFile = util.promisify(fs.writeFile);
    await mkdir(Path, { recursive: true });
    await writeFile(filePath, binaryData);
    let media = [
      {
        filename,
        type: body.type,
        properties: body.properties,
        tags: body.tags,
        createdBy: vendorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        duration: body.duration,
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
  } catch (error) {
    throw error;
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
      ERROR_MESSAGES.MEDIA_NOT_FOUND,
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
  let [vendor, layout, composition] = await Promise.all([
    Vendor.findOne({
      _id: vendorId,
      isDeleted: false,
    })
      .lean()
      .populate({ path: "compositions" }),
    Layout.findOne({ title: "Single Zone Landscape" }).lean(),
    Composition.findOne({ _id: body.id, createdBy: vendorId }).lean(),
  ]);

  let contentPlaying;

  if (body.type === CONTENT_TYPE.MEDIA) {
    vendor.media = vendor.media.find(
      (id) => id._id.toString() === body.id.toString()
    );
    if (!vendor.media) {
      throw new AuthFailedError(
        ERROR_MESSAGES.WRONG_TYPE_OR_ID,
        STATUS_CODES.ACTION_FAILED
      );
    }

    const composition = await Composition.create({
      name: vendor.media.title,
      layout: layout._id,
      createdBy: vendorId,
      zones: {
        name: layout.zones[0].name,
        zoneId: layout.zones[0]._id,
        content: {
          url: vendor.media.title,
          type: vendor.media.type,
          maintainAspectRatio: false,
          fitToScreen: true,
          crop: false,
          duration: vendor.media.duration,
          data: "",
        },
      },
    });

    contentPlaying = {
      media: composition,
      duration: body.duration,
      type: "media",
      startTime: new Date(localtime(new Date(), timezone) + "Z"),
      endTime: new Date(localtime(new Date(), timezone) + "Z"),
      createdAt: new Date(localtime(new Date(), timezone) + "Z"),
    };

    let mediaReport = {
      media: vendor.media._id,
      title: vendor.media.title,
      day: localtime(new Date(), timezone).split("T")[0],
      time: new Date(localtime(new Date(), timezone) + "Z"),
      loop: Math.floor(
        Number(body.duration) / Number(vendor?.media?.duration ?? 1)
      ),
      duration: Number(body.duration),
    };

    await Vendor.findByIdAndUpdate(
      vendorId,
      { $push: { mediaReport } },
      { new: 1, lean: 1 }
    );
  } else {
    if (!composition) {
      throw new AuthFailedError(
        ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }

    contentPlaying = {
      media: composition,
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

  if (contentPlaying.media) {
    for (const id of body.screenIds) {
      let screen = await Screen.findOne({ _id: id, isDeleted: false }).populate(
        {
          path: "device",
        }
      );

      if (body.type === CONTENT_TYPE.MEDIA) {
        const index = screen.contentPlaying.findIndex(
          (item) => item.type === CONTENT_TYPE.MEDIA
        );
        if (index !== -1) {
          screen.contentPlaying.splice(index, 1);
        }
      }

      screen = await Screen.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $push: { contentPlaying } },
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
      emit(screen.device?.deviceToken, contentPlaying, "", body.type);
    }
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

export const mediaDetail = async (_id, mediaId) => {
  const vendor = await Vendor.findById(_id, { media: 1 }).lean();

  vendor.media = vendor.media.find(
    (item) => JSON.stringify(item._id) === JSON.stringify(mediaId)
  );

  return vendor;
};

export const assignGroup = async (_id, screenId, groupIds) => {
  const vendor = await Vendor.findById(_id, { groups: 1 }).lean();

  if (groupIds.length > 0)
    for (const id of groupIds) {
      const groupIds = JSON.stringify(vendor.groups);

      if (!groupIds.includes(id)) {
        throw new AuthFailedError(
          ERROR_MESSAGES.GROUP_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }
    }

  const screen = await Screen.findOneAndUpdate(
    {
      _id: screenId,
      isDeleted: false,
    },
    { $set: { groups: groupIds } }
  ).lean();

  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCREEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const settings = async (type, _id) => {
  const screen = await Screen.findOne({ _id, isDeleted: false });

  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCREEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  if (type === SCREEN_SETTINGS.DATA) {
    const screen = await Screen.findOneAndUpdate(
      { _id, isDeleted: false },
      { $unset: { schedule: "" }, $set: { contentPlaying: [] } },
      { new: 1, lean: 1 }
    )
      .populate({ path: "device" })
      .lean();

    emit(screen.device?.deviceToken, screen.contentPlaying);
  }
  if (type === SCREEN_SETTINGS.RELOAD) {
    const screen = await Screen.findOne({ _id, isDeleted: false })
      .populate({ path: "device" })
      .lean();

    const device = await Device.findOneAndUpdate(
      {
        deviceToken: screen.device.deviceToken,
      },
      { $set: { isReload: true } }
    );

    emit(screen.device?.deviceToken, screen.contentPlaying);

    function emitagain() {
      emit(screen.device?.deviceToken, screen.contentPlaying);
    }
    setTimeout(emitagain, 500);
  }
};
