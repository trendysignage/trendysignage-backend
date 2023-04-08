import { mediaService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const addMedia = catchAsync(async (req, res) => {
  await mediaService.addMedia(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
