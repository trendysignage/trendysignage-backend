import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import {
  adminVendorService,
  logService,
  profileService,
} from "../../services/index.js";
import { formatVendor } from "../../utils/formatResponse.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const getVendor = catchAsync(async (req, res) => {
  const vendor = await adminVendorService.getVendor(req.query.vendorId);
  formatVendor(vendor);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    vendor
  );
});

export const addVendor = catchAsync(async (req, res) => {
  const { name, email, password, screens } = req.body;
  await adminVendorService.addVendor(name, email, password, screens);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteVendor = catchAsync(async (req, res) => {
  await adminVendorService.deleteVendor(req.query.vendorId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const list = catchAsync(async (req, res) => {
  const data = await adminVendorService.list(req.query);
  data.vendors.map((vendor) => {
    formatVendor(vendor);
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
    data
  );
});
