import { catchAsync } from "../../utils/universalFunction.js";
import { profileService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { formatVendor } from "../../utils/formatResponse.js";

export const defaultComposition = catchAsync(async (req, res) => {
  await profileService.defaultComposition(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getProfile = catchAsync(async (req, res) => {
  const data = await profileService.getProfile(req.token.vendor._id);
  formatVendor(data);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const editProfile = catchAsync(async (req, res) => {
  await profileService.editProfile(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
