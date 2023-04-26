import { catchAsync } from "../../utils/universalFunction.js";
import { layoutService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";

export const layouts = catchAsync(async (req, res) => {
  const layouts = await layoutService.layouts();
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    layouts
  );
});

export const addLayout = catchAsync(async (req, res) => {
  await layoutService.addLayout(req.token.vendor._id, req.body);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteLayout = catchAsync(async (req, res) => {
  await layoutService.deleteLayout(req.token.vendor._id, req.query.layoutId);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editLayout = catchAsync(async (req, res) => {
  await layoutService.editLayout(req.token.vendor._id, req.body);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
