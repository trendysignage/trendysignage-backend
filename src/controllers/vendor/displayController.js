import { catchAsync } from "../../utils/universalFunction.js";
import { displayService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";

export const deviceCode = catchAsync(async (req, res) => {
  await displayService.deviceCode(req.token.vendor._id, req.body.code);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getScreens = catchAsync(async (req, res) => {
  const screen = await displayService.getScreens(
    req?.query,
    req.token.vendor._id
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

export const getMedia = catchAsync(async (req, res) => {
  const media = await displayService.getMedia(
    req.headers.host,
    req.query,
    req.token.vendor._id
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    media
  );
});

export const addMedia = catchAsync(async (req, res) => {
  await displayService.addMedia(req.token.vendor._id, req.body, req.file);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editMedia = catchAsync(async (req, res) => {
  await displayService.editMedia(req.token.vendor._id, req.body, req.file);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteMedia = catchAsync(async (req, res) => {
  await displayService.deleteMedia(req.token.vendor._id, req.query.mediaId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const publish = catchAsync(async (req, res) => {
  await displayService.publish(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
