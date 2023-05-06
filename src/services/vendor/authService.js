import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor, Screen, Device } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import bcrypt from "bcryptjs";

export const login = async (email, password) => {
  const vendor = await Vendor.findOne({
    email,
    isDeleted: false,
  }).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (!(await bcrypt.compare(password, vendor.password))) {
    throw new AuthFailedError(
      ERROR_MESSAGES.WRONG_PASSWORD,
      STATUS_CODES.AUTH_FAILED
    );
  }
  return vendor;
};

export const signup = async (email, password, name) => {
  if (
    await Vendor.findOne({ email: email, isDeleted: false, isVerified: true })
  ) {
    throw new AuthFailedError(
      ERROR_MESSAGES.EMAIL_ALREADY_EXIST,
      STATUS_CODES.ACTION_FAILED
    );
  }
  let pass = await bcrypt.hash(password, 8);
  const vendor = await Vendor.create({
    name,
    email,
    password: pass,
  });
  return vendor;
};

export const verify = async (_id, tokenOtp, bodyOtp, tokenId) => {
  if (!(tokenOtp == bodyOtp)) {
    throw new AuthFailedError(
      ERROR_MESSAGES.OTP_FAILED,
      STATUS_CODES.AUTH_FAILED
    );
  }
  const updateVendor = await Vendor.findByIdAndUpdate(
    _id,
    {
      $set: { isVerified: true },
    },
    { new: true, lean: true }
  );
  return updateVendor;
};
