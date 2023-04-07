import { catchAsync } from "../../utils/universalFunction.js";
import { displayService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";

export const addScreen = catchAsync(async (req, res) => {
  const screen = await displayService.addScreen(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editScreen = catchAsync(async (req, res) => {
  await displayService.editScreen(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteScreen = catchAsync(async (req, res) => {
  await displayService.deleteScreen(req.token.vendor._id, req.query.screenId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
