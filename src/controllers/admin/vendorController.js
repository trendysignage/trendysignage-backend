import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import {
  adminVendorService,
  displayService,
  logService,
  profileService,
} from "../../services/index.js";
import { formatResellerVendor } from "../../utils/formatResponse.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const getVendor = catchAsync(async (req, res) => {
  const vendor = await adminVendorService.getVendor(req.query.vendorId);
  formatResellerVendor(vendor);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    vendor
  );
});

export const addVendor = catchAsync(async (req, res) => {
  const {
    name,
    email,
    password,
    screens,
    duration,
    startDate,
    endDate,
    resellerId,
  } = req.body;
  await adminVendorService.addVendor(
    req.token.admin._id,
    name,
    email,
    password,
    screens,
    duration,
    startDate,
    endDate,
    resellerId
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editVendor = catchAsync(async (req, res) => {
  const { vendorId, name, screens, duration, startDate, endDate } = req.body;
  await adminVendorService.editVendor(
    req.token.admin._id,
    vendorId,
    name,
    screens,
    duration,
    startDate,
    endDate
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteVendor = catchAsync(async (req, res) => {
  await adminVendorService.deleteVendor(
    req.token.admin._id,
    req.query.vendorId
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const list = catchAsync(async (req, res) => {
  const data = await adminVendorService.list(req.token.admin._id, req.query);
  data.vendors.map((vendor) => {
    formatResellerVendor(vendor);
  });
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const mediaReport = catchAsync(async (req, res) => {
  const data = await profileService.mediaReport(req.query.vendorId, req.query);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const uptimeReport = catchAsync(async (req, res) => {
  const data = await profileService.uptimeReport(req.query.vendorId, req.query);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const auditReport = catchAsync(async (req, res) => {
  const logs = await logService.getLogs(
    req.query.vendorId,
    req.query,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    logs
  );
});

export const getScreen = catchAsync(async (req, res) => {
  const screen = await displayService.getScreen(req.query.screenId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    screen
  );
});
