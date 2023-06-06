import { STATUS_CODES, ERROR_MESSAGES } from "../config/appConstants.js";
import { AuthFailedError } from "../utils/errors.js";
import { Logs } from "../models/index.js";
import { utcTime } from "../utils/formatResponse.js";

export const createLog = async (vendorId, data, timezone) => {
  const log = await Logs.create({
    vendor: vendorId,
    title: data,
    createdAt: utcTime(new Date(), timezone),
  });
  if (!log) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return log;
};
