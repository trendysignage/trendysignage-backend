import {
  ERROR_MESSAGES,
  STATUS_CODES,
  DEVICE_TYPE,
} from "../config/appConstants.js";
import { Vendor, Token, Device, Screen } from "../models/index.js";
import { AuthFailedError } from "../utils/errors.js";
import { io, userCache } from "../libs/socket.js";

export const getVendor = async (deviceToken) => {
  const device = await Device.findOne({
    deviceToken: deviceToken,
    isDeleted: false,
  }).lean();
  if (!device) {
    throw new AuthFailedError(
      ERROR_MESSAGES.DEVICE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (device.isVerified) {
    return device.vendor;
  }
};

export const getDevice = async (screenId) => {
  const screen = await Screen.findOne({
    _id: screenId,
    isDeleted: false,
    device: { $exists: true },
  }).lean();
  if (!screen) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCREEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const device = await Device.findOne({
    _id: screen.device,
    isDeleted: false,
    isVerified: true,
  }).lean();
  if (!device) {
    throw new AuthFailedError(
      ERROR_MESSAGES.DEVICE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return device.deviceToken;
};

export const getContent = async (vendorId, mediaId) => {
  const vendor = await Vendor.findOne({
    _id: vendorId,
    "media._id": mediaId,
    isDeleted: false,
  }).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  vendor.media = vendor.media.filter(
    (m) => JSON.stringify(m._id) === JSON.stringify(mediaId)
  );
  return vendor.media[0];
};

export const getDefault = async (vendorId) => {
  const vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
  }).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  vendor.defaultComposition.isDefault = true;
  return vendor.defaultComposition;
};

export const emit = async (value, content, data) => {
  if (!userCache[value]) {
    userCache[value] = userCache[value];
  }
  if (!data) {
    userCache[value]?.map((id) => {
      io.to(id).emit("receiveContent", content);
    });
  } else {
    userCache[value]?.map((id) => {
      io.to(id).emit("disconnectDevice", "Disconnected");
    });
  }
};
