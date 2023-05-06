import { Device } from "../models/index.js";

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

const generateOtp = () => {
  const code = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
  const otpExpires = new Date();
  otpExpires.setSeconds(otpExpires.getSeconds() + 240);
  return { code, expiresAt: otpExpires };
};

export { catchAsync, pick, generateDeviceCode, generateOtp };
