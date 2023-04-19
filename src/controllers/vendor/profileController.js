import { catchAsync } from "../../utils/universalFunction.js";
import { profileService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";

export const defaultComposition = catchAsync(async (req, res) => {
  await profileService.defaultComposition(req.token.vendor._id, req.file);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
