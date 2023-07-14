import bcrypt from "bcryptjs";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Composition, Profile, Screen, Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { paginationOptions } from "../../utils/universalFunction.js";
import { emit } from "../socketService.js";

export const defaultComposition = async (vendorId, body) => {
  const composition = await Composition.findOne({
    _id: body.compositionId,
    isDeleted: false,
  }).lean();

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
    .populate({ path: "screens", populate: { path: "device" } });

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  for (const screen of vendor.screens) {
    if (screen.device) {
      vendor.defaultComposition.isDefault = true;
      await emit(screen.device?.deviceToken, vendor.defaultComposition);
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

export const uptimeReport = async (vendorId, query) => {
  let data = {
    isDeleted: false,
    vendor: vendorId,
    uptimeReport: {
      $elemMatch: { day: { $gte: query.startDate, $lte: query.endDate } },
    },
  };

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
      "uptimeReport.$": 1,
      tags: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    paginationOptions(query.page, query.limit)
  );

  return reports;
};

export const mediaReport = async (vendorId, query) => {
  const reports = await Vendor.findById(vendorId, { media: 1 }).lean();

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

async function see() {
  const screen = await Screen.findOne(
    {
      _id: "64ad0991de6c3163fc86e328",
      uptimeReport: {
        $elemMatch: { day: { $gte: "2023-07-01", $lte: "2023-07-30" } },
      },
    },
    { uptimeReport: 1 },
    paginationOptions(0, 100)
  ).lean();

  console.log(screen);
}

see();
