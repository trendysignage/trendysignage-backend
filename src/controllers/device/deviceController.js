import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { deviceService } from "../../services/index.js";
import { successResponse } from "../../utils/response.js";
import {
  catchAsync,
  generateDeviceCode,
} from "../../utils/universalFunction.js";

export const addDevice = catchAsync(async (req, res) => {
  const deviceCode = await generateDeviceCode();
  const timezone = req.headers.timezone ?? "Asia/Kolkata";
  const device = await deviceService.addDevice(
    req.body.deviceToken,
    deviceCode,
    timezone
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    device
  );
});

export const addDevice1 = catchAsync(async (req, res) => {
  const deviceCode = await generateDeviceCode();
  const timezone = req.headers.timezone ?? "Asia/Kolkata";
  const device = await deviceService.addDevice1(
    req.body.deviceToken,
    deviceCode,
    timezone
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    device
  );
});

// export const addDev = catchAsync(async (req, res) => {
//   const deviceCode = await generateDeviceCode();
//   const timezone = req.headers.timezone ?? "Asia/Kolkata";
//   const device = await deviceService.addDev(
//     req.body.deviceToken,
//     deviceCode,
//     timezone
//   );
//   return successResponse(
//     req,
//     res,
//     STATUS_CODES.SUCCESS,
//     SUCCESS_MESSAGES.SUCCESS,
//     device
//   );
// });
