import { Device, Reseller, Vendor } from "../models/index.js";
import os from "os";
import { publicIp, publicIpv4, publicIpv6 } from "public-ip";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log(err);
    next(err);
  });
};

const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

const paginationOptions = (page, limit) => {
  return { sort: { _id: -1 }, skip: page * limit, limit: limit, lean: true };
};

const generateDeviceCode = async () => {
  let code = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  do {
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (
    await Device.findOne({
      isDeleted: false,
      isVerified: true,
      deviceCode: code,
    }).lean()
  );
  return code;
};

const generateId = async () => {
  let id = 0;
  do {
    id = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
  } while (
    (await Reseller.findOne({ id, isDeleted: false }),
    await Vendor.findOne({ id, isDeleted: false }))
  );
  return id;
};

const generateOtp = () => {
  // const code = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
  const code = 22222;
  const otpExpires = new Date();
  otpExpires.setSeconds(otpExpires.getSeconds() + 240);
  return { code, expiresAt: otpExpires };
};

const netInterface = async () => {
  const nets = os.networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
        results[name].push(net.mac);
      }
    }
  }

  return {
    mac: results.en0[1],
    privateIp: results.en0[0],
    publicIp: await publicIpv4(),
  };
};

export {
  catchAsync,
  generateDeviceCode,
  generateId,
  generateOtp,
  paginationOptions,
  pick,
  netInterface,
};
