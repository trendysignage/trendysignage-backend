import bcrypt from "bcryptjs";
import {
  ERROR_MESSAGES,
  ROLE,
  STATUS_CODES,
  TAG_TYPE,
} from "../../config/appConstants.js";
import {
  Composition,
  Layout,
  Profile,
  Quickplay,
  Schedule,
  Screen,
  Vendor,
} from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { paginationOptions } from "../../utils/universalFunction.js";
import { emit } from "../socketService.js";

export const defaultComposition = async (vendorId, body) => {
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

  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    { $set: { defaultComposition } },
    { new: true, lean: 1 }
  )
    .lean()
    .populate([
      {
        path: "screens",
        populate: [
          { path: "device" },
          { path: "defaultComposition.media.layout" },
        ],
      },
      {
        path: "defaultComposition.media.layout",
      },
    ]);

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  for (const screen of vendor.screens) {
    if (screen.device) {
      let defaultComposition = vendor.defaultComposition;

      const [layout, screenData] = await Promise.all([
        Layout.findOne({
          _id: defaultComposition?.media?.layout,
        }).lean(),
        Screen.findOneAndUpdate(
          { _id: screen._id, isDeleted: false },
          { $set: { defaultComposition } },
          { new: 1, lean: 1 }
        ),
      ]);

      if (layout) {
        defaultComposition.media.layout = layout;
      }

      vendor.defaultComposition.isDefault = true;
      emit(screen.device?.deviceToken, screenData.defaultComposition);
    }
  }
};

export const getVendorByEmail = async (email) => {
  const user = await Vendor.findOne({
    email: email,
    isDeleted: false,
    isVerified: true,
  }).lean();
  if (!user) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return user;
};

export const getProfile = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return vendor;
};

export const editProfile = async (vendorId, body) => {
  let dataToBeUpdated = {
    name: body.name,
    profilePic: body.profilePic,
  };
  if (body.phoneNumber && body.countryCode) {
    dataToBeUpdated.phoneNumber = body.phoneNumber;
    dataToBeUpdated.countryCode = body.countryCode;
  }
  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    {
      $set: dataToBeUpdated,
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

export const getRoles = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId, { roles: 1 }, { lean: 1 });
  delete vendor.roles.ADMIN;
  return vendor;
};

export const editRole = async (vendorId, body) => {
  await Vendor.updateMany(
    { $or: [{ vendor: vendorId }, { _id: vendorId }] },
    { $set: { roles: body } }
  );
};

// used in vendor and superAdmin
export const uptimeReport = async (vendorId, query) => {
  let data = {
    isDeleted: false,
    vendor: vendorId,
  };

  if (query.startDate && query.endDate) {
    data = {
      ...data,
      uptimeReport: {
        $elemMatch: { day: { $gte: query.startDate, $lte: query.endDate } },
      },
    };
  }

  if (query.tags) {
    data = { ...data, tags: { $in: query.tags } };
  }
  if (query.groups) {
    data = { ...data, groups: { $in: query.groups } };
  }
  if (query.search) {
    let searchReg = RegExp(query.search, "i");
    data = { ...data, name: { $regex: searchReg } };
  }

  const reports = await Screen.find(
    data,
    {
      name: 1,
      uptimeReport: 1,
      tags: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    paginationOptions(query.page, query.limit)
  );

  console.log(reports, "kjfnbrth");

  if (query.startDate && query.endDate) {
    reports?.map((report) => {
      report.uptimeReport = report?.uptimeReport?.filter(
        (i) => i.day >= query.startDate && i.day <= query.endDate
      );
    });
  }

  return reports;
};

// used in vendor and superAdmin
export const mediaReport = async (vendorId, query) => {
  let data = {
    isDeleted: false,
    _id: vendorId,
  };

  if (query.startDate && query.endDate) {
    data = {
      ...data,
      mediaReport: {
        $elemMatch: { day: { $gte: query.startDate, $lte: query.endDate } },
      },
    };
  }

  const vendor = await Vendor.findOne(data, {
    media: 1,
    mediaReport: 1,
  }).lean();

  if (query.startDate && query.endDate) {
    vendor.mediaReport = vendor?.mediaReport?.filter(
      (report) => report.day >= query.startDate && report.day <= query.endDate
    );
  }

  const reducedReport = vendor?.mediaReport?.reduce((acc, curr) => {
    const { media, duration, loop } = curr;
    const mediaObject = vendor.media.find(
      (m) => JSON.stringify(m._id) === JSON.stringify(media)
    );

    if (mediaObject) {
      if (acc[media]) {
        acc[media].loop += Number(loop);
        acc[media].duration += Number(duration);
      } else {
        acc[media] = { mediaObject, loop, duration };
      }
    }

    return acc;
  }, {});

  const reports = Object.values(reducedReport);

  return reports;
};

export const getUsers = async (vendor) => {
  const users = await Vendor.find({
    vendor,
    isDeleted: false,
    isVerified: true,
  }).lean();

  return users;
};

export const addUser = async (vendorId, body) => {
  if (
    await Vendor.findOne({
      email: body.email,
      isDeleted: false,
    }).lean()
  ) {
    throw new AuthFailedError(
      ERROR_MESSAGES.EMAIL_ALREADY_EXIST,
      STATUS_CODES.ACTION_FAILED
    );
  }

  const password = await bcrypt.hash(body.password, 8);

  const user = await Vendor.create({
    name: body.name,
    email: body.email,
    password,
    role: body.role,
    userGroups: body.groups,
    vendor: vendorId,
    isVerified: true,
    isEnabled: true,
  });

  return user.toObject();
};

export const editUser = async (vendorId, body) => {
  const user = await Vendor.findOneAndUpdate(
    { _id: body.userId, vendor: vendorId, isDeleted: false },
    {
      $set: {
        name: body.name,
        role: body.role,
        userGroups: body.groups,
      },
    },
    { new: 1, lean: 1 }
  );

  if (!user) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const deleteUser = async (vendorId, _id) => {
  const user = await Vendor.findOneAndUpdate(
    {
      vendor: vendorId,
      isDeleted: false,
      _id,
    },
    { $set: { isDeleted: true } },
    { new: 1, lean: 1 }
  );

  if (!user) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const changePassword = async (vendorId, body) => {
  const password = bcrypt.hash(body.password, 8);

  const user = await Vendor.findOneAndUpdate(
    {
      _id: body.userId,
      vendor: vendorId,
      isDeleted: false,
    },
    { $set: { password } },
    { new: 1, lean: 1 }
  );

  if (!user) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const disableUser = async (vendorId, _id) => {
  const user = await Vendor.findOneAndUpdate(
    {
      _id,
      vendor: vendorId,
      isDeleted: false,
    },
    { $set: { isEnabled: false } },
    { new: 1, lean: 1 }
  );

  if (!user) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const getGroups = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId, { groups: 1 }).lean();

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  return vendor;
};

export const addGroups = async (vendorId, body) => {
  const groups = [
    {
      name: body.name,
      description: body.description,
    },
  ];

  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    {
      $push: { groups },
    },
    { new: 1, lean: 1 }
  );

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  return vendor;
};

export const editGroups = async (vendorId, body) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      "groups._id": body.groupId,
    },
    {
      $set: {
        "groups.$.name": body.name,
        "groups.$.description": body.description,
      },
    },
    { new: 1, lean: 1 }
  );

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.GROUP_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const deleteGroup = async (vendorId, groupId) => {
  const screen = await Screen.findOne({ groups: groupId }).lean();

  if (screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.GROUP_ASSOCIATED_TO_SCREEN,
      STATUS_CODES.ACTION_FAILED
    );
  }

  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      "groups._id": groupId,
    },
    {
      $pull: {
        groups: { _id: groupId },
      },
    },
    { new: 1, lean: 1 }
  );

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.GROUP_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const getTags = async (_id, type) => {
  let tags = [];
  if (type === "screens") {
    const screens = await Screen.find({ vendor: _id }, { tags: 1 }).lean();
    screens.forEach((screen) => {
      if (screen.tags.length > 0) tags = [...tags, ...screen.tags];
    });
  } else if (type === "media") {
    const vendor = await Vendor.findById(_id, { media: 1 }).lean();
    vendor.media.forEach((item) => {
      if (item.tags.length > 0) tags = [...tags, ...item.tags];
    });
  } else if (type === "composition") {
    const compositions = await Composition.find(
      { createdBy: _id },
      { tags: 1 }
    ).lean();
    compositions.forEach((composition) => {
      if (composition.tags.length > 0) tags = [...tags, ...composition.tags];
    });
  } else if (type === "schedule") {
    const schedules = await Schedule.find(
      { createdBy: _id },
      { tags: 1 }
    ).lean();
    schedules.forEach((schedule) => {
      if (schedule.tags && schedule?.tags?.length > 0)
        tags = [...tags, ...schedule.tags];
    });
  }
  return tags;
};

export const addTags = async (vendorId, body) => {
  if (body.type === TAG_TYPE.SCREEN) {
    const screen = await Screen.findByIdAndUpdate(body.id, {
      $set: { tags: body.tags },
    });
    if (!screen) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCREEN_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  } else if (body.type === TAG_TYPE.COMPOSITION) {
    const composition = await Composition.findByIdAndUpdate(body.id, {
      $set: { tags: body.tags },
    });
    if (!composition) {
      throw new AuthFailedError(
        ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  } else if (body.type === TAG_TYPE.MEDIA) {
    const vendor = await Vendor.findOneAndUpdate(
      { _id: vendorId, "media._id": body.id },
      { $set: { "media.$.tags": body.tags } }
    );
    if (!vendor) {
      throw new AuthFailedError(
        ERROR_MESSAGES.MEDIA_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  } else if (body.type === TAG_TYPE.SCHEDULE) {
    const schedule = await Schedule.findByIdAndUpdate(body.id, {
      $set: { tags: body.tags },
    });
    if (!schedule) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  } else if (body.type === TAG_TYPE.QUICKPLAY) {
    const quickplay = await Quickplay.findByIdAndUpdate(body.id, {
      $set: { tags: body.tags },
    });
    if (!quickplay) {
      throw new AuthFailedError(
        ERROR_MESSAGES.QUICKPLAY_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  }
};

export const getDeviceProfiles = async (vendor) => {
  const profiles = await Profile.find({ vendor, isDeleted: false }).lean();

  return profiles;
};

export const addDeviceProfile = async (vendor, body) => {
  const profile = await Profile.create({
    name: body.name,
    logo: {
      title: body.title,
      type: body.type,
      coordinates: {
        x: body.x,
        y: body.y,
      },
      dimensions: {
        height: body.height,
        width: body.width,
      },
      orientation: body.orientation,
    },
    vendor,
    screenHealthIndicator: body.screenHealthIndicator,
  });
  return profile;
};

export const editDeviceProfile = async (vendor, body) => {
  const dataToBeUpdated = {
    name: body.name,
    logo: {
      title: body.title,
      type: body.type,
      coordinates: {
        x: body.x,
        y: body.y,
      },
      dimensions: {
        height: body.height,
        width: body.width,
      },
      orientation: body.orientation,
    },
    screenHealthIndicator: body.screenHealthIndicator,
  };

  const profile = await Profile.findOneAndUpdate(
    {
      _id: body.profileId,
      isDeleted: false,
      vendor,
    },
    { $set: dataToBeUpdated },
    { new: 1, lean: 1 }
  );

  if (!profile) {
    throw new AuthFailedError(
      ERROR_MESSAGES.DEVICE_PROFILE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const deleteDeviceProfile = async (vendor, _id) => {
  const profile = await Profile.findOneAndUpdate(
    {
      _id,
      vendor,
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: 1, lean: 1 }
  );

  if (!profile) {
    throw new AuthFailedError(
      ERROR_MESSAGES.DEVICE_PROFILE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const assign = async (vendor, body) => {
  const profile = await Profile.findOne({
    _id: body.profileId,
    isDeleted: false,
    vendor,
  }).lean();

  if (!profile) {
    throw new AuthFailedError(
      ERROR_MESSAGES.DEVICE_PROFILE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  for (const _id of body.screens) {
    const screen = await Screen.findOneAndUpdate(
      { _id, isDeleted: false },
      { $set: { deviceProfile: profile } }
    ).lean();
    if (!screen) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCREEN_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  }

  await Profile.updateOne(
    { _id: profile._id },
    { $set: { screens: body.screens } },
    { new: 1, lean: 1 }
  );
};

export const getVendorRole = async (_id) => {
  const vendor = await Vendor.findById(_id, { role: 1, roles: 1 }).lean();

  if (vendor.role === ROLE.ADMIN) {
    vendor.permission = {
      SCREEN: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      ASSETS: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      COMPOSITION: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      SCHEDULE: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      APPS: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      QUICKPLAY: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      REPORTS: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
    };
  } else {
    vendor.permission = vendor.roles[vendor.role];
  }

  delete vendor.roles;
  return vendor;
};

export const mfa = async (_id, body) => {
  const vendor = await Vendor.findByIdAndUpdate(_id, {
    $set: { mfaEnabled: body.mfaEnabled, mfa: body.mfa },
  });
};
