import Joi from "joi";
import { objectId } from "../validations/custom.validation.js";

export const ADMIN_PERMISSIONS = {
  view: { type: Boolean, default: true },
  add: { type: Boolean, default: true },
  edit: { type: Boolean, default: true },
  delete: { type: Boolean, default: true },
};

export const PERMISSIONS = {
  view: { type: Boolean, default: false },
  add: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
};

export const ADMIN_PERMISSION_MENU = {
  SCREEN: ADMIN_PERMISSIONS,
  ASSETS: ADMIN_PERMISSIONS,
  COMPOSITION: ADMIN_PERMISSIONS,
  SCHEDULE: ADMIN_PERMISSIONS,
  APPS: ADMIN_PERMISSIONS,
  QUICKPLAY: ADMIN_PERMISSIONS,
  REPORTS: ADMIN_PERMISSIONS,
};

export const PERMISSION_MENU = {
  SCREEN: PERMISSIONS,
  ASSETS: PERMISSIONS,
  COMPOSITION: PERMISSIONS,
  SCHEDULE: PERMISSIONS,
  APPS: PERMISSIONS,
  QUICKPLAY: PERMISSIONS,
  REPORTS: PERMISSIONS,
};

export const ROLES_SCHEMA = {
  ADMIN: ADMIN_PERMISSION_MENU,
  OPERATOR: PERMISSION_MENU,
  MANAGER: PERMISSION_MENU,
  EDITOR: PERMISSION_MENU,
};

export const ROLE = {
  ADMIN: "ADMIN",
  OPERATOR: "OPERATOR",
  MANAGER: "MANAGER",
  EDITOR: "EDITOR",
};

export const MEDIA_TYPE = {
  IMAGE: "image",
  VIDEO: "video",
  APP: "app",
};

export const SUBSCRIPTION_STATUS = {
  EXPIRING: "expiring soon",
  INACTIVE: "inactive",
  ACTIVE: "active",
  PENDING: "payment pending",
};

export const COMPOSITION_LAYOUT = {
  SINGLE_LANDSCAPE: "Single Zone Landscape",
  TWO_LANDSCAPE: "Two Landscape",
  THREE_LANDSCAPE: "Three Landscape",
};

export const TOKEN_TYPE = {
  ACCESS: "access",
  REFRESH: "refresh",
  RESET_PASSWORD: "resetPassword",
};

export const USER_TYPE = {
  ADMIN: "admin",
  VENDOR: "vendor",
};

export const DEVICE_TYPE = {
  IPHONE: "iPhone",
  ANDROID: "android",
  WEB: "web",
};

export const SOCIAL = {
  FACEBOOK: "facebook",
  GOOGLE: "google",
  APPLE: "apple",
};

export const CONTENT_TYPE = {
  MEDIA: "media",
  COMPOSITION: "composition",
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
  SEARCH: Joi.string().allow("").replace("(", "\\(").replace(")", "\\)"),
  OBJECTID: Joi.string().custom(objectId).required(),
  DEVICE_TYPE: Joi.string()
    .valid(...Object.values(DEVICE_TYPE))
    .required(),
  ROLE: Joi.string()
    .valid(...Object.values(USER_TYPE))
    .required(),
  BOOLEAN: Joi.boolean().required(),
};

export const screenPermissions = Joi.object()
  .keys({
    view: JOI.BOOLEAN,
    add: JOI.BOOLEAN,
    edit: JOI.BOOLEAN,
    delete: JOI.BOOLEAN,
  })
  .required();

export const roleSchema = Joi.object()
  .keys({
    SCREEN: screenPermissions,
    ASSETS: screenPermissions,
    COMPOSITION: screenPermissions,
    SCHEDULE: screenPermissions,
    APPS: screenPermissions,
    QUICKPLAY: screenPermissions,
    REPORTS: screenPermissions,
  })
  .required();

export const editRoleSchema = Joi.object()
  .keys({
    OPERATOR: roleSchema,
    MANAGER: roleSchema,
    EDITOR: roleSchema,
  })
  .required();

const SUCCESS_MESSAGES = {
  SUCCESS: "Success",
  LOGOUT: "User successfully logged out",
  MAIL_SENT: "Mail sent successfully",
  LOGIN: "successfully Logged in",
  ADDED_SCREEN: "successfully added a new screen",
  EDIT_SCREEN: "successfully edited a screen",
  DELETE_SCREEN: "deleted a screen",
  ADD_MEDIA: "successfully added new media",
  EDIT_MEDIA: "successfully edited a media file",
  DELETE_MEDIA: "deleted a media file",
  PUBLISHED_MEDIA: "successfully published media to a screen",
  PUBLISHED_COMPOSITION: "successfully published composition to a screen",
  ADD_COMPOSITION: "successfully added a new composition",
  EDIT_COMPOSITION: "successfully edited a composition",
  DELETE_COMPOSITION: "deleted a composition",
  DEFAULT_COMPOSITION:
    "successfully changed the default composition for a screen",
  EDIT_PROFILE: "edited their profile",
  EDIT_ROLES: "edited a role",
  ADD_SCHEDULE: "successfully added a new schedule",
  EDIT_SCHEDULE: "edited a schedule",
  DELETE_SCHEDULE: "deleted a schedule",
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
  VENDOR_NOT_FOUND: "Vendor not found",
  DEVICE_NOT_FOUND: "Device not found",
  SCREEN_NOT_FOUND: "Screen not found",
  VENDORID_ALREADY_EXIST: "VendorId already exist, please try again",
  ADMIN_NOT_FOUND: "Admin not found",
  ACCOUNT_NOT_VERIFIED: "Please verify your account.",
  WRONG_DEVICE_CODE: "The Device code you entered is wrong, please try again.",
  DEFAULT_MEDIA:
    "The media you are trying to delete is set as default composition and thus cannot be deleted.",
  LAYOUT_FAILED: "Failed to create Layout, Please try again!",
  LAYOUT_NOT_FOUND: "Layout not found.",
  COMPOSITION_NOT_FOUND: "Composition not found.",
  SCHEDULE_NOT_FOUND: "Schedule not found.",
  OTP_EXPIRED: "OTP has expired, please try again.",
  OTP_FAILED: "Incorrect OTP",
  OTP_ALREADY_VERIFIED: "Already verified, you can sign in!",
  TOKEN_NOT_FOUND: "Token not found!",
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

export { JOI, SUCCESS_MESSAGES, ERROR_MESSAGES, STATUS_CODES };
