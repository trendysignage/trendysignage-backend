import { ERROR_MESSAGES, STATUS_CODES } from "../config/appConstants.js";
import { Logs } from "../models/index.js";
import { AuthFailedError } from "../utils/errors.js";
import { localtime, utcTime } from "../utils/formatResponse.js";
import { paginationOptions } from "../utils/universalFunction.js";

export const createLog = async (vendorId, data, timezone) => {
  let createdAt = utcTime(new Date(), timezone);
  const log = await Logs.create({
    vendor: vendorId,
    title: data,
    createdAt,
  });
  if (!log) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return log;
};

export const getLogs = async (vendorId, query, timezone) => {
  const logs = await Logs.find(
    {
      vendor: vendorId,
      isDeleted: false,
      createdAt: { $gte: query.startDate, $lte: query.endDate },
    },
    {},
    paginationOptions(query.page, query.limit)
  ).lean();

  logs.map((log) => {
    log.createdAt = localtime(log.createdAt, timezone);
  });

  return logs;
};
