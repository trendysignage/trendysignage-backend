import {
  ERROR_MESSAGES,
  LOG_MESSAGES,
  STATUS_CODES,
  SUCCESS_MESSAGES,
  USER_TYPE,
} from "../../config/appConstants.js";
import config from "../../config/config.js";
import {
  forgotPasswordEmail,
  verificationEmail,
} from "../../libs/sendEmail.js";
import {
  logService,
  profileService,
  tokenService,
  vendorAuthService,
} from "../../services/index.js";
import { getProfile } from "../../services/vendor/profileService.js";
import { AuthFailedError } from "../../utils/errors.js";
import { formatVendor } from "../../utils/formatResponse.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync, generateOtp } from "../../utils/universalFunction.js";

export const login = catchAsync(async (req, res) => {
  let { email, password } = req.body;

  const vendor = await vendorAuthService.login(email, password);
  formatVendor(vendor);
  console.log(vendor);
  const token = await tokenService.generateAuthToken(vendor, USER_TYPE.VENDOR);
  const updateToken = await tokenService.isVerified(token.token);
  await logService.createLog(
    vendor._id,
    LOG_MESSAGES.LOGIN,
    req.headers.timezone ?? "Asia/Kolkata"
  );
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
  const token = await tokenService.generateAuthToken(vendor, role, "", otp);
  verificationEmail(email, vendor.name, otp.code);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.MAIL_SENT,
    { token, vendor }
  );
});

export const verify = catchAsync(async (req, res) => {
  const { otp, vendor, token } = req.token;
  if (!otp) {
    throw new AuthFailedError(
      ERROR_MESSAGES.OTP_ALREADY_VERIFIED,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const data = await vendorAuthService.verify(
    vendor._id,
    otp.code,
    req.body.otp
  );
  await tokenService.isVerified(token);
  formatVendor(data);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const socialLogin = catchAsync(async (req, res) => {
  const { socialId, name, email } = req.body;
  const role = "vendor";
  const vendor = await vendorAuthService.socialLogin(socialId, email, name);
  const token = await tokenService.generateAuthToken(vendor, role, "");
  await tokenService.isVerified(token.token);
  formatVendor(vendor);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    {
      token,
      vendor,
    }
  );
});

export const resendOtp = catchAsync(async (req, res) => {
  const vendor = await getProfile(req.token.vendor._id);
  const otp = generateOtp();
  const token = await tokenService.generateAuthToken(vendor, "vendor", "", otp);
  verificationEmail(vendor.email, vendor.name, otp.code);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.MAIL_SENT,
    { token, vendor }
  );
});

//---------forgot password-------------//
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    email
  );
  const user = await profileService.getVendorByEmail(email);
  await forgotPasswordEmail(email, resetPasswordToken, user.name);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.MAIL_SENT
  );
});

export const forgotPage = async (req, res) => {
  try {
    const tokenData = await tokenService.verifyResetPasswordToken(
      req.query.token
    );
    if (tokenData) {
      return res.render("./forgotPassword/forgotPassword", {
        title: "Forgot Password",
        token: req.query.token,
        projectName: config.projectName,
      });
    }
    return res.render("commonMessage", {
      title: "Forgot Password",
      errorMessage: "Sorry, this link has been expired",
      projectName: config.projectName,
    });
  } catch (err) {
    res.render("commonMessage", {
      title: "Forgot Password",
      errorMessage: "Sorry, this link has been expired",
      projectName: config.projectName,
    });
  }
};

export const resetPassword = catchAsync(async (req, res) => {
  try {
    const token = await tokenService.verifyResetPasswordToken(req.query.token);
    if (!token) {
      return res.render("commonMessage", {
        title: "Forgot Password",
        errorMessage: "Sorry, this link has been expired",
        projectName: config.projectName,
      });
    }

    const { password } = req.body;
    await vendorAuthService.resetPassword(
      token.vendor._id,
      password,
      token._id
    );
    return res.render("commonMessage", {
      title: "Forgot Password",
      successMessage: "Your password is successfully changed",
      projectName: config.projectName,
    });
  } catch (err) {
    console.log(err);
    res.render("commonMessage", {
      title: "Forgot Password",
      errorMessage: err,
      projectName: config.projectName,
    });
  }
});
//-------------------------------------//

export const verifyToken = catchAsync(async (req, res) => {
  const token = await tokenService.verifyResetPasswordToken(
    req.headers.authorization
  );
  await tokenService.getTokenById(token.type, token.id);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const changePassword = catchAsync(async (req, res) => {
  await vendorAuthService.changePassword(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
