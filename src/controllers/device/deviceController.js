import { catchAsync } from "../../utils/universalFunction.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { deviceService } from "../../services/index.js";
import { generateDeviceCode } from "../../utils/universalFunction.js";

export const addDevice = catchAsync(async (req, res) => {
  const deviceCode = await generateDeviceCode();
  const device = await deviceService.addDevice(
    req.query.deviceToken,
    deviceCode
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    device
  );
});
