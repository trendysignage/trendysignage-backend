import {
  LOG_MESSAGES,
  STATUS_CODES,
  SUCCESS_MESSAGES,
} from "../../config/appConstants.js";
import { appService, logService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const getApps = catchAsync(async (req, res) => {
  const apps = await appService.getApps(req.token.vendor._id);
  return successResponse(
    req,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.SUCCESS,
    apps
  );
});

export const createApp = catchAsync(async (req, res) => {
  const app = await appService.createApp(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.SUCCESS,
    app
  );
});

export const editApp = catchAsync(async (req, res) => {
  await appService.editApp(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.SUCCESS
  );
});
