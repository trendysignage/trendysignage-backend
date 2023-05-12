import moment from "moment";
import jwt from "jsonwebtoken";
import { ObjectId as ObjectID } from "mongodb";
import config from "../config/config.js";
import {
  TOKEN_TYPE,
  STATUS_CODES,
  USER_TYPE,
  ERROR_MESSAGES,
} from "../config/appConstants.js";
import { AuthFailedError } from "../utils/errors.js";
import { Token } from "../models/index.js";
import { profileService } from "./index.js";

export const generateToken = (data, secret = config.jwt.secret) => {
  const payload = {
    user: data.user,
    exp: data.tokenExpires.unix(),
    type: data.tokenType,
    id: data.tokenId,
    role: data.userType,
  };
  return jwt.sign(payload, secret);
};

export const saveToken = async (data) => {
  let dataToBesaved = {
    expires: data.tokenExpires.toDate(),
    type: data.tokenType,
    _id: data.tokenId,
    device: { token: data.deviceToken },
    role: data.userType,
    token: data.token,
    otp: data.otp,
  };
  if (data.userType) {
    if (!data.loginType) {
      if (data.userType === USER_TYPE.ADMIN) {
        dataToBesaved.admin = data.user._id;
        dataToBesaved.isVerified = true;
      } else {
        dataToBesaved.vendor = data.user._id;
      }
    }
  }
  const tokenDoc = await Token.create(dataToBesaved);
  return tokenDoc;
};

export const generateAuthToken = async (user, userType, deviceToken, otp) => {
  const tokenExpires = moment().add(config.jwt.accessExpirationMinutes, "days");
  var tokenId = new ObjectID();
  const accessToken = generateToken({
    tokenExpires,
    tokenType: TOKEN_TYPE.ACCESS,
    userType,
    tokenId,
  });
  await saveToken({
    token: accessToken,
    tokenExpires,
    tokenId,
    deviceToken,
    tokenType: TOKEN_TYPE.ACCESS,
    userType,
    otp,
    user,
  });
  return {
    token: accessToken,
    expires: tokenExpires.toDate(),
  };
};

export const refreshAuth = async (user, tokenId, userType, device) => {
  await Token.findByIdAndUpdate(tokenId, { isDeleted: true });
  return generateAuthToken(user, userType, device.token);
};

export const updateSocial = async (accessToken) => {
  const update = await Token.findOneAndUpdate(
    accessToken,
    { $set: { isVerified: true } },
    {
      sort: { created: -1 },
      upsert: true,
    }
  ).lean();
  return update;
};

export const logout = async (tokenId) => {
  const token = await Token.findOne({ _id: tokenId, isDeleted: false });
  if (!token) {
    throw new AuthFailedError(
      ERROR_MESSAGES.AUTHENTICATION_FAILED,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const updatedToken = await Token.findByIdAndUpdate(tokenId, {
    isDeleted: true,
  });
  return updatedToken;
};

export const isVerified = async (token) => {
  const data = await Token.findOneAndUpdate(
    token,
    {
      $set: { isVerified: true },
      $unset: { otp: "" },
    },
    { new: true, lean: true }
  );
  return data;
};

export const generateResetPasswordToken = async (email) => {
  const user = await profileService.getVendorByEmail(email);
  var tokenId = new ObjectID();
  const tokenExpires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "day"
  );

  const resetPasswordToken = generateToken({
    tokenId: tokenId,
    user: user._id,
    tokenExpires,
    tokenType: TOKEN_TYPE.RESET_PASSWORD,
  });
  await saveToken({
    token: resetPasswordToken,
    tokenExpires,
    tokenId,
    tokenType: TOKEN_TYPE.RESET_PASSWORD,
    userType: USER_TYPE.VENDOR,
    user: user,
  });
  return resetPasswordToken;
};

export const verifyResetPasswordToken = async (token) => {
  try {
    jwt.verify(token, config.jwt.secret);
    const data = await Token.findOne({ token }).lean();
    return data;
  } catch (err) {
    return err;
  }
};

export const getTokenById = async (type, _id) => {
  const token = await Token.findOne({ type, _id });
  if (!token) {
    throw new AuthFailedError(
      ERROR_MESSAGES.TOKEN_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return token;
};
