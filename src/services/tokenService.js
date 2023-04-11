import moment from "moment";
import jwt from "jsonwebtoken";
import { ObjectId as ObjectID } from "mongodb";
import config from "../config/config.js";
import {
  TOKEN_TYPE,
  STATUS_CODES,
  ROLE,
  ERROR_MESSAGES,
} from "../config/appConstants.js";
import { AuthFailedError, OperationalError } from "../utils/errors.js";
import { Token, Vendor, Admin } from "../models/index.js";
// const { OperationalError, AuthFailedError } = require("../utils/errors");
// const { Token, User } = require("../models");

exports.generateToken = (data, secret = config.jwt.secret) => {
  const payload = {
    exp: data.tokenExpires.unix(),
    type: data.tokenType,
    id: data.tokenId,
    role: data.userType,
  };
  return jwt.sign(payload, secret);
};

exports.saveToken = async (data) => {
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
      if (data.userType === ROLE.ADMIN) {
        dataToBesaved.admin = data.user._id;
      } else {
        dataToBesaved.vendor = data.user._id;
      }
    }
  }
  const tokenDoc = await Token.create(dataToBesaved);
  return tokenDoc;
};

exports.generateAuthToken = async (user, userType, deviceToken, otp) => {
  const tokenExpires = moment().add(config.jwt.accessExpirationMinutes, "days");
  var tokenId = new ObjectID();
  const accessToken = exports.generateToken({
    tokenExpires,
    tokenType: TOKEN_TYPE.ACCESS,
    userType,
    tokenId,
  });
  await exports.saveToken({
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

exports.refreshAuth = async (user, tokenId, userType, device) => {
  await Token.findByIdAndUpdate(tokenId, { isDeleted: true });
  return exports.generateAuthToken(user, userType, device.token);
};

exports.updateToken = async (token, otp, phoneNumber, countryCode) => {
  const update = await Token.findOneAndUpdate(
    { _id: token },
    {
      $set: { otp: { code: otp.code, expiresAt: otp.expiresAt } },
      phoneNumber: phoneNumber,
      countryCode: countryCode,
    }
  );
  return update;
};

exports.update = async (userId, accessToken, createCustomer) => {
  let updateUser;
  if (createCustomer) {
    updateUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          stripeId: createCustomer.id,
          phoneNumber: accessToken.phoneNumber,
          countryCode: accessToken.countryCode,
        },
      },
      { new: true, lean: true }
    ).populate({ path: "usualOrders.item" });
  } else {
    updateUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          phoneNumber: accessToken.phoneNumber,
          countryCode: accessToken.countryCode,
        },
      },
      { new: true, lean: true }
    ).populate({ path: "usualOrders.item" });
  }
  const token = await Token.findOneAndUpdate(
    { _id: accessToken._id },
    {
      $unset: {
        phoneNumber: accessToken.phoneNumber,
        countryCode: accessToken.countryCode,
      },
    },
    { new: true, lean: true }
  );
  return updateUser;
};

exports.updateSocial = async (accessToken) => {
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

exports.logout = async (tokenId) => {
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

exports.isVerified = async (token) => {
  const data = await Token.findOneAndUpdate(
    token,
    { $set: { isVerified: true } },
    { new: true, lean: true }
  );
  return data;
};
