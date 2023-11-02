import {
  LOG_MESSAGES,
  STATUS_CODES,
  SUCCESS_MESSAGES,
} from "../../config/appConstants.js";
import { layoutService, logService } from "../../services/index.js";
import { formatVendor } from "../../utils/formatResponse.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

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

export const editLayout = catchAsync(async (req, res) => {
  await layoutService.editLayout(req.token.vendor._id, req.body);
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

export const uploadFile = catchAsync(async (req, res) => {
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    req.file.path.substring("public".length)
  );
});

export const getCompositions = catchAsync(async (req, res) => {
  const compositions = await layoutService.getCompositions(
    req.token.vendor._id,
    req.query
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_COMPOSITIONS,
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

export const getComposition = catchAsync(async (req, res) => {
  const composition = await layoutService.getComposition(
    req.query.compositionId
  );
  formatVendor(composition.createdBy);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    composition
  );
});

export const addComposition = catchAsync(async (req, res) => {
  const composition = await layoutService.addComposition(
    req.token.vendor._id,
    req.body
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADD_COMPOSITION,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const editComposition = catchAsync(async (req, res) => {
  await layoutService.editComposition(
    req.token.vendor._id,
    req.body,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.EDIT_COMPOSITION,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteComposition = catchAsync(async (req, res) => {
  await layoutService.deleteComposition(
    req.token.vendor._id,
    req.query.compositionId
  );
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.DELETE_COMPOSITION,
    req.headers.timezone ?? "Asia/Kolkata"
  );

  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
