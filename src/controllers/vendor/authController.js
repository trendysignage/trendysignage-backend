import {
  vendorAuthService,
  tokenService,
  profileService,
  logService,
} from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import {
  ERROR_MESSAGES,
  STATUS_CODES,
  SUCCESS_MESSAGES,
  USER_TYPE,
} from "../../config/appConstants.js";
import { catchAsync, generateOtp } from "../../utils/universalFunction.js";
import { formatVendor } from "../../utils/formatResponse.js";
import { sendEmail, forgotPasswordEmail } from "../../libs/sendEmail.js";
import { AuthFailedError } from "../../utils/errors.js";
import config from "../../config/config.js";

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
  // await logService.createLog(
  //   vendor._id,
  //   SUCCESS_MESSAGES.LOGIN,
  //   req.headers.timezone
  // );
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
  const { otp, vendor, _id } = req.token;
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
  await tokenService.isVerified(_id);
  formatVendor(data);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
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
