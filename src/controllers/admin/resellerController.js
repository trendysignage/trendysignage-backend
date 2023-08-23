import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { adminResellerService } from "../../services/index.js";
import { formatResellerVendor } from "../../utils/formatResponse.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const list = catchAsync(async (req, res) => {
  const data = await adminResellerService.list(req.query);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const getReseller = catchAsync(async (req, res) => {
  const reseller = await adminResellerService.getReseller(req.query.resellerId);
  reseller.vendors?.map((v) => {
    formatResellerVendor(v);
  });
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    reseller
  );
});

export const addReseller = catchAsync(async (req, res) => {
  await adminResellerService.addReseller(req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editReseller = catchAsync(async (req, res) => {
  await adminResellerService.editReseller(req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteReseller = catchAsync(async (req, res) => {
  await adminResellerService.deleteReseller(req.query.resellerId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
