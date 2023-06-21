import { STATUS_CODES, SUCCESS_MESSAGES } from "../config/appConstants.js";
import { tokenService } from "../services/index.js";
import { successResponse } from "../utils/response.js";
import { catchAsync } from "../utils/universalFunction.js";

export const logout = catchAsync(async (req, res) => {
  await tokenService.logout(req.token._id);
  // await logService.createLog(
  //   req.token.vendor._id,
  //   SUCCESS_MESSAGES.LOGOUT,
  //   req.headers.timezone
  // );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.LOGOUT
  );
});
