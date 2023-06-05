import {
  ERROR_MESSAGES,
  ROLE,
  STATUS_CODES,
} from "../../config/appConstants.js";
import { Vendor, Screen, Device } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { emit } from "../socketService.js";

export const defaultComposition = async (vendorId, body) => {
  let media = {
    title: body.title,
    type: body.type,
  };
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      isDeleted: false,
    },
    { $set: { defaultComposition: { media, duration: body.duration } } },
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
  const vendor = await Vendor.findByIdAndUpdate(vendorId, {
    $set: { roles: body },
  });
};

async function update() {
  console.log("profileService");
  await Vendor.updateMany({}, { role: ROLE.ADMIN });
}

update();
