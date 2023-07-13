import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { displayService } from "../../services/index.js";
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
  console.log(req.headers.timezone, "fkjnfjnnvngn");
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
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.ADDED_SCREEN,
  //   req.headers.timezone
  // );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editScreen = catchAsync(async (req, res) => {
  await displayService.editScreen(req.token.vendor._id, req.body);
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.EDIT_SCREEN,
  //   req.headers.timezone
  // );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteScreen = catchAsync(async (req, res) => {
  await displayService.deleteScreen(req.token.vendor._id, req.query.screenId);
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.DELETE_SCREEN,
  //   req.headers.timezone
  // );
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
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getMedia = catchAsync(async (req, res) => {
  const media = await displayService.getMedia(req.query, req.token.vendor._id);
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
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.ADD_MEDIA,
  //   req.headers.timezone
  // );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editMedia = catchAsync(async (req, res) => {
  await displayService.editMedia(req.token.vendor._id, req.body, req.file);
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.EDIT_MEDIA,
  //   req.headers.timezone
  // );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteMedia = catchAsync(async (req, res) => {
  await displayService.deleteMedia(req.token.vendor._id, req.query.mediaId);
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.DELETE_MEDIA,
  //   req.headers.timezone
  // );
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
  // if (req.body.type === "media") {
  //   await logService.createLog(
  //     req.token.vendor._id,
  //     SUCCESS_MESSAGES.PUBLISHED_MEDIA,
  //     req.headers.timezone
  //   );
  // } else {
  //   await logService.createLog(
  //     req.token.vendor._id,
  //     SUCCESS_MESSAGES.PUBLISHED_COMPOSITION,
  //     req.headers.timezone
  //   );
  // }
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
