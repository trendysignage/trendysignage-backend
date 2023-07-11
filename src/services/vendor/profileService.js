import bcrypt from "bcryptjs";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Composition, Screen, Vendor } from "../../models/index.js";
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
  const reports = await Screen.find(
    {
      isDeleted: false,
      vendor: vendorId,
      uptimeReport: {
        $elemMatch: { day: { $gte: query.startDate, $lte: query.endDate } },
      },
    },
    {
      name: 1,
      "uptimeReport.$": 1,
      screenLocation: 1,
      googleLocation: 1,
      tags: 1,
      defaultComposition: 1,
      createdAt: 1,
      updatedAt: 1,
      groups: 1,
      isConnected: 1,
      schedule: 1,
      contentPlaying: 1,
      device: 1,
    },
    paginationOptions(query.page, query.limit)
  ).populate([{ path: "device" }, { path: "schedule", select: ["-screens"] }]);

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

export const addGroups = async (vendorId) => {
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
