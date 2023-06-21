import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { adminVendorService } from "../../services/index.js";
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
