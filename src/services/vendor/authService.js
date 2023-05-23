import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor, Screen, Device, Token } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import bcrypt from "bcryptjs";
import { generateId } from "../../utils/universalFunction.js";

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
  const id = await generateId();
  const vendor = await Vendor.create({
    id,
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

export const resetPassword = async (vendorId, newPassword, tokenId) => {
  let updatedPassword = await bcrypt.hash(newPassword, 8);
  const user = await Vendor.findByIdAndUpdate(vendorId, {
    $set: { password: updatedPassword },
  });
  await Token.deleteOne({ _id: tokenId });
  return user;
};

export const changePassword = async (vendorId, body) => {
  const vendor = await Vendor.findById(vendorId).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (!(await bcrypt.compare(body.oldPassword, vendor.password))) {
    throw new AuthFailedError(
      ERROR_MESSAGES.WRONG_PASSWORD,
      STATUS_CODES.AUTH_FAILED
    );
  }
  let newPass = await bcrypt.hash(body.newPassword, 8);
  await Vendor.findByIdAndUpdate(vendorId, { $set: { password: newPass } });
};
