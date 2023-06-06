import { STATUS_CODES, ERROR_MESSAGES } from "../config/appConstants.js";
import { AuthFailedError } from "../utils/errors.js";
import { Logs } from "../models/index.js";
import { utcTime } from "../utils/formatResponse.js";
import { paginationOptions } from "../utils/universalFunction.js";

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

export const getLogs = async (vendorId, query) => {
  const logs = await Logs.find(
    {
      vendor: vendorId,
      isDeleted: false,
      createdAt: { $gte: query.startDate, $lt: query.endDate },
    },
    {},
    paginationOptions(query.page, query.limit)
  ).lean();

  return logs;
};
