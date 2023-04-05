const Joi = require("joi");
const { objectId } = require("../validations/custom.validation");

exports.TOKEN_TYPE = {
  ACCESS: "access",
  REFRESH: "refresh",
  RESET_PASSWORD: "resetPassword",
};

exports.USER_TYPE = {
  ADMIN: "admin",
  VENDOR: "vendor",
};

exports.DEVICE_TYPE = {
  IPHONE: "iPhone",
  ANDROID: "android",
  WEB: "web",
};

exports.SOCIAL = {
  FACEBOOK: "facebook",
  GOOGLE: "google",
  APPLE: "apple",
};

const JOI = {
  EMAIL: Joi.string().email().lowercase().trim().required(),
  PASSWORD: Joi.string().min(6).required(),
  PHONENUMBER: Joi.string()
    .max(10)
    .min(10)
    .message("Please enter a valid phone number"),
  LIMIT: Joi.number().default(10),
  PAGE: Joi.number().default(0),
  OBJECTID: Joi.string().custom(objectId).required(),
  DEVICE_TYPE: Joi.string()
    .valid(...Object.values(this.DEVICE_TYPE))
    .required(),
  ROLE: Joi.string()
    .valid(...Object.values(this.USER_TYPE))
    .required(),
};

const SUCCESS_MESSAGES = {
  SUCCESS: "Success",
  LOGOUT: "User successfully logged out",
  SUBSCRIBER_ADDED:
    "Thanks for showing the interest, will keep you posted with the updates",
};

const ERROR_MESSAGES = {
  NOT_FOUND: "Not found",
  VALIDATION_FAILED: "Validation Failed, Kindly check your parameters",
  SERVER_ERROR: "Something went wrong, Please try again.",
  AUTHENTICATION_FAILED: "Please authenticate",
  UNAUTHORIZED: "You are not authorized to perform this action",
  EMAIL_ALREADY_EXIST: "This email already exist. Please try with other email",
  EMAIL_NOT_FOUND: "Email not found",
  ACCOUNT_NOT_EXIST: "Account does not exist",
  PHONE_NUMBER_ALREADY_EXIST:
    "This phone number already exist. Please try with other phone Number",
  WRONG_PASSWORD: "Password is Incorrect",
  ACCOUNT_DELETED: "Your account has been deleted by Admin",
  ACCOUNT_BLOCKED: "Your account has been blocked by Admin",
  USER_NOT_FOUND: "User not found",
  USERID_ALREADY_EXIST: "UserId already exist, please try again",
  ADMIN_NOT_FOUND: "Admin not found",
};

const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  ACTION_PENDING: 202,
  ACTION_COMPLETE: 204,
  VALIDATION_FAILED: 400,
  ACTION_FAILED: 400,
  AUTH_FAILED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

module.exports = {
  JOI,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STATUS_CODES,
};
