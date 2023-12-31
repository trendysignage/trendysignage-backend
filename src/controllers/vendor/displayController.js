import {
  LOG_MESSAGES,
  SCREEN_SETTINGS,
  STATUS_CODES,
  SUCCESS_MESSAGES,
} from "../../config/appConstants.js";
import { displayService, logService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

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
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_SCREENS,
    req.headers.timezone ?? "Asia/Kolkata"
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
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADDED_SCREEN,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editScreen = catchAsync(async (req, res) => {
  await displayService.editScreen(req.token.vendor._id, req.body);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.EDIT_SCREEN,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteScreen = catchAsync(async (req, res) => {
  await displayService.deleteScreen(req.token.vendor._id, req.query.screenId);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.DELETE_SCREEN,
    req.headers.timezone ?? "Asia/Kolkata"
  );
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

export const changeDefaultComposition = catchAsync(async (req, res) => {
  await displayService.changeDefaultComposition(req.token.vendor._id, req.body);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.SCREEN_DEFAULT_COMPOSITION,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getMedia = catchAsync(async (req, res) => {
  const media = await displayService.getMedia(req.query, req.token.vendor._id);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_MEDIA,
    req.headers.timezone ?? "Asia/Kolkata"
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
  console.log("<<--------------uploaded successfully--------------->>");
  await displayService.addMedia(req.token.vendor._id, req.body, req.file);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADD_MEDIA,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const addMediaBase64 = catchAsync(async (req, res) => {
  console.log("<<--------------uploaded successfully--------------->>");
  console.log(req.body);
  await displayService.addMedia64(
    req.token.vendor._id,
    req.body,
    req.body.base64String
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADD_MEDIA,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editMedia = catchAsync(async (req, res) => {
  await displayService.editMedia(req.token.vendor._id, req.body, req.file);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.EDIT_MEDIA,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteMedia = catchAsync(async (req, res) => {
  await displayService.deleteMedia(req.token.vendor._id, req.query.mediaId);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.DELETE_MEDIA,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const publish = catchAsync(async (req, res) => {
  const timezone = req.headers?.timezone ?? "Asia/Kolkata";
  await displayService.publish(req.token.vendor._id, req.body, timezone);
  if (req.body.type === "media") {
    logService.createLog(
      req.token.vendor._id,
      LOG_MESSAGES.PUBLISHED_MEDIA,
      timezone
    );
  } else {
    logService.createLog(
      req.token.vendor._id,
      LOG_MESSAGES.PUBLISHED_COMPOSITION,
      timezone
    );
  }
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const mediaFile = catchAsync(async (req, res) => {
  const file = await displayService.mediaFile(req.query.path);
  res.sendFile(file);
});

export const mediaDetail = catchAsync(async (req, res) => {
  const data = await displayService.mediaDetail(
    req.token.vendor._id,
    req.query.mediaId
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const assignGroup = catchAsync(async (req, res) => {
  const data = await displayService.assignGroup(
    req.token.vendor._id,
    req.body.screenId,
    req.body.groupIds
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const settings = catchAsync(async (req, res) => {
  const { type, screenId } = req.body;
  await displayService.settings(type, screenId);

  const successMessage =
    type === SCREEN_SETTINGS.CACHE
      ? SUCCESS_MESSAGES.CLEAR_CACHE
      : type === SCREEN_SETTINGS.DATA
      ? SUCCESS_MESSAGES.CLEAR_DATA
      : type === SCREEN_SETTINGS.REBOOT
      ? SUCCESS_MESSAGES.REBOOT
      : SUCCESS_MESSAGES.RELOAD;

  return successResponse(req, res, STATUS_CODES.SUCCESS, successMessage);
});
