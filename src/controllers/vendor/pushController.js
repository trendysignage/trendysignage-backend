import {
  LOG_MESSAGES,
  STATUS_CODES,
  SUCCESS_MESSAGES,
} from "../../config/appConstants.js";
import { logService, pushService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const schedules = catchAsync(async (req, res) => {
  const schedules = await pushService.schedules(
    req.token.vendor._id,
    req.query
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_SCHEDULES,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    schedules
  );
});

export const getSchedule = catchAsync(async (req, res) => {
  const schedule = await pushService.getSchedule(req.query.scheduleId);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    schedule
  );
});

export const addSchedule = catchAsync(async (req, res) => {
  const schedule = await pushService.addSchedule(
    req.token.vendor._id,
    req.body
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADD_SCHEDULE,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    schedule
  );
});

export const editSchedule = catchAsync(async (req, res) => {
  await pushService.editSchedule(req.token.vendor._id, req.body);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.EDIT_SCHEDULE,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteSchedule = catchAsync(async (req, res) => {
  await pushService.deleteSchedule(req.token.vendor._id, req.query.scheduleId);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.DELETE_SCHEDULE,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const sequenceList = catchAsync(async (req, res) => {
  const sequences = await pushService.sequenceList(
    req.token.vendor._id,
    req.query.scheduleId
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    sequences
  );
});

export const getSequence = catchAsync(async (req, res) => {
  const sequence = await pushService.getSequence(req.query);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    sequence
  );
});

export const addSequence = catchAsync(async (req, res) => {
  const timezone = req.headers?.timezone ?? "Asia/Kolkata";
  await pushService.addSequence(req.token.vendor._id, req.body, timezone);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editSequence = catchAsync(async (req, res) => {
  const timezone = req.headers?.timezone ?? "Asia/Kolkata";
  await pushService.editSequence(req.token.vendor._id, req.body, timezone);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteSequence = catchAsync(async (req, res) => {
  await pushService.deleteSequence(req.token.vendor._id, req.query);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const dates = catchAsync(async (req, res) => {
  await pushService.dates(req.token.vendor._id, req.body);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getQuickplay = catchAsync(async (req, res) => {
  const data = await pushService.getQuickplay(req.token.vendor._id, req.query);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_QUICKPLAY,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const addQuickplay = catchAsync(async (req, res) => {
  const timezone = req.headers.timezone ?? "Asia/Kolkata";
  const data = await pushService.addQuickplay(
    req.token.vendor._id,
    req.body,
    timezone
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADD_QUICKPLAY,
    timezone
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const deleteQuickplay = catchAsync(async (req, res) => {
  await pushService.deleteQuickplay(req.token.vendor._id, req.query.id);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.DELETE_QUICKPLAY,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getDefaultCompositions = catchAsync(async (req, res) => {
  const compositions = await pushService.getDefaultCompositions(
    req.token.vendor._id,
    req.query
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_DEFAULT_COMPOSITIONS,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    compositions
  );
});

export const addDefaultComp = catchAsync(async (req, res) => {
  const compositions = await pushService.addDefaultComp(
    req.token.vendor._id,
    req.body
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADD_DEFAULT_COMPOSITIONS,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    compositions
  );
});

export const editDefaultComposition = catchAsync(async (req, res) => {
  await pushService.editDefaultComposition(req.token.vendor._id, req.body);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADD_TAGS_TO_DEFAULT_COMPOSITIONS,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const assignScreens = catchAsync(async (req, res) => {
  await pushService.assignScreens(req.token.vendor._id, req.body);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.SCHEDULE_ASSIGN_SCREEN,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
