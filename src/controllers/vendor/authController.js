import { vendorAuthService, tokenService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import {
  STATUS_CODES,
  SUCCESS_MESSAGES,
  USER_TYPE,
} from "../../config/appConstants.js";
import { catchAsync } from "../../utils/universalFunction.js";
import { formatVendor } from "../../utils/formatResponse";

export const login = catchAsync(async (req, res) => {
  let { email, password } = req.body;

  const vendor = await vendorAuthService.login(email, password);
  formatVendor(vendor);
  const token = await tokenService.generateAuthToken(
    vendor,
    USER_TYPE.VENDOR,
    req.body.deviceToken
  );

  const updateToken = await tokenService.isVerified(token);

  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { token, vendor }
  );
});
