import { vendorAuthService, tokenService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import {
  STATUS_CODES,
  SUCCESS_MESSAGES,
  USER_TYPE,
} from "../../config/appConstants.js";
import { catchAsync, generateOtp } from "../../utils/universalFunction.js";
import { formatVendor } from "../../utils/formatResponse.js";
import { sendEmail } from "../../libs/sendEmail.js";

export const login = catchAsync(async (req, res) => {
  let { email, password } = req.body;

  const vendor = await vendorAuthService.login(email, password);
  formatVendor(vendor);
  const token = await tokenService.generateAuthToken(
    vendor,
    USER_TYPE.VENDOR
    // req.body.deviceToken
  );

  const updateToken = await tokenService.isVerified(token);

  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { token, vendor }
  );
});

export const signup = catchAsync(async (req, res) => {
  let { email, password, role, name } = req.body;
  const vendor = await vendorAuthService.signup(email, password, name);
  formatVendor(vendor);
  const otp = generateOtp();
  const token = await tokenService.generateAuthToken(
    vendor,
    role,
    "req.body.deviceToken",
    otp
  );
  console.log(otp);
  // sendEmail({
  //   from: process.env.EMAIL,
  //   to: email,
  //   subject: "OTP for Trendy signup",
  //   text: otp,
  // });
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { token, vendor }
  );
});

export const verify = catchAsync(async (req, res) => {
  const { otp, vendor, token } = req.token;
  const tokenOtp = otp.code;
  const bodyOtp = req.body.otp;
  const data = await vendorAuthService.verify(vendor._id, tokenOtp, bodyOtp);
  await tokenService.isVerified(token);
  formatVendor(data);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
