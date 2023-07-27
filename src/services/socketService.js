import {
  CONTENT_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} from "../config/appConstants.js";
import { io, userCache } from "../libs/socket.js";
import { Device, Screen, Vendor } from "../models/index.js";
import { AuthFailedError } from "../utils/errors.js";

export const getVendor = async (deviceToken) => {
  const device = await Device.findOne({
    deviceToken,
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
  vendor.media = vendor.media.find(
    (m) => JSON.stringify(m._id) === JSON.stringify(mediaId)
  );
  return vendor.media;
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
  if (vendor.defaultComposition) {
    vendor.defaultComposition.isDefault = true;
  }
  return vendor.defaultComposition;
};

export const emit = async (value, content, data, type) => {
  if (!data) {
    if (type === CONTENT_TYPE.COMPOSITION) {
      userCache[value]?.map((id) => {
        console.log(id, "yese emitititting android comp");
        io.to(id).emit("receiveComposition", content);
      });
    } else {
      userCache[value]?.map((id) => {
        console.log(id, "yese emitititt");
        io.to(id).emit("receiveContent", content);
      });
    }
  } else {
    userCache[value]?.map((id) => {
      io.to(id).emit("disconnectDevice", "Disconnected");
    });
  }
};

export const uptimeReport = async (deviceToken, timezone) => {
  console.log("-----uptimereport trackning-----");
  const device = await Device.findOne({ deviceToken, isDeleted: false });
  if (device) {
    const screen = await Screen.findOne({
      device: device._id,
      isDeleted: false,
    });
    if (screen) {
      await screen.startUptimeTracking(timezone);
    }
  }
};

export const stopTracking = async (deviceToken, timezone) => {
  const device = await Device.findOne({ deviceToken, isDeleted: false });
  if (device) {
    const screen = await Screen.findOne({
      device: device._id,
      isDeleted: false,
    });
    if (screen) {
      console.log(screen, "screen of utpimeee");
      await screen.stopUptimeTracking(timezone);
    }
  }
};

export const getScreen = async (deviceToken) => {
  const device = await Device.findOne(
    { deviceToken, isDeleted: false },
    { screen: 1 }
  )
    .lean()
    .populate({ path: "screen" });

  return device?.screen;
};
