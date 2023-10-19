import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { adminAuthService, tokenService } from "../../services/index.js";
import { formatAdmin } from "../../utils/formatResponse.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const login = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  const data = await adminAuthService.login(email, password, role);
  const token = await tokenService.generateAuthToken(data, role);
  formatAdmin(data);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { token, admin: data }
  );
});

export const changePassword = catchAsync(async (req, res) => {
  await adminAuthService.changePassword(req.token.admin._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const dashboard = catchAsync(async (req, res) => {
  const dashboard = await adminAuthService.dashboard(req.token.admin._id);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    dashboard
  );
});

export const editMfa = catchAsync(async (req, res) => {
  await adminAuthService.editMfa(req.token.admin._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
