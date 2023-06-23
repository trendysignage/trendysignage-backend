import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { pushService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const schedules = catchAsync(async (req, res) => {
  const schedules = await pushService.schedules(
    req.token.vendor._id,
    req.query
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
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.ADD_SCHEDULE,
  //   req.headers.timezone
  // );
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
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.EDIT_SCHEDULE,
  //   req.headers.timezone
  // );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteSchedule = catchAsync(async (req, res) => {
  await pushService.deleteSchedule(req.token.vendor._id, req.query.scheduleId);
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.DELETE_SCHEDULE,
  //   req.headers.timezone
  // );
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
  await pushService.editSequence(req.token.vendor._id, req.body);
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
