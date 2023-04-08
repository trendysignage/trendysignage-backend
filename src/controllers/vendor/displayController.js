import { catchAsync } from "../../utils/universalFunction.js";
import { displayService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";

export const getScreens = catchAsync(async (req, res) => {
  const screen = await displayService.getScreens(
    req?.query?.search,
    req?.token?.vendor?._id
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    screen
  );
});

export const addScreen = catchAsync(async (req, res) => {
  const screen = await displayService.addScreen(
    req?.token?.vendor?._id,
    req.body
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editScreen = catchAsync(async (req, res) => {
  await displayService.editScreen(req?.token?.vendor?._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteScreen = catchAsync(async (req, res) => {
  await displayService.deleteScreen(
    req?.token?.vendor?._id,
    req.query.screenId
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const addMedia = catchAsync(async (req, res) => {
  await displayService.addMedia(req?.token?.vendor?._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
