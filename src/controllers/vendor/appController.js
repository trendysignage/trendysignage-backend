import {
  LOG_MESSAGES,
  STATUS_CODES,
  SUCCESS_MESSAGES,
} from "../../config/appConstants.js";
import { appService, logService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const createApp = catchAsync(async (req, res) => {
  const app = await appService.createApp(req.token.vendor._id, req.body);
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.CREATE_APP,
    req.headers.timezone ?? "Asia/Kolkata"
  );
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
  logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.EDIT_APP,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.SUCCESS
  );
});
