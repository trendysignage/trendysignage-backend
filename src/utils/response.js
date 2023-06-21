import {
  ERROR_MESSAGES,
  STATUS_CODES,
  SUCCESS_MESSAGES,
} from "../config/appConstants.js";

import {
  AuthFailedError,
  NotFoundError,
  OperationalError,
  ValidationError,
} from "./errors.js";

const successResponse = (
  req,
  res,
  statusCode = STATUS_CODES.SUCCESS,
  message = SUCCESS_MESSAGES.SUCCESS,
  data
) => {
  const result = {
    statusCode,
    message: res.__(message), //Added Localization to response
    data,
  };

  return res.status(statusCode).json(result);
};

const createResponse = (
  req,
  res,
  data,
  message = SUCCESS_MESSAGES.SUCCESS,
  statusCode = STATUS_CODES.CREATED
) => {
  const result = {
    statusCode,
    message: res.__(message), //Added Localization to response
    data,
  };

  return res.status(statusCode).json(result);
};

const errorResponse = (error, req, res) => {
  const statusCode =
    error.code ||
    error.statusCode ||
    error.response?.status ||
    STATUS_CODES.ERROR;

  const logError = error.logError ?? true;
  //@ts-ignore
  //const reqId = req["reqId"];
  if (statusCode === STATUS_CODES.ERROR) {
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    Error.captureStackTrace(error, error.constructor);
  }
  if (logError) {
    //let initiator = errorLine(error);
    // console.error(error);
    // logger.error((reqId) => {
    //   `${reqId}, initiator=>${initiator}, Stack=>${error.stack}`;
    // });
  }
  if (statusCode === STATUS_CODES.ERROR) {
    return res.status(statusCode).json({
      statusCode,
      message: res.__(ERROR_MESSAGES.SERVER_ERROR),
      // data: {},
    });
  }

  const message =
    error instanceof NotFoundError ||
    error instanceof ValidationError ||
    error instanceof OperationalError ||
    error instanceof AuthFailedError
      ? res.__(error.message)
      : error.toString();

  return res
    .status(statusCode >= 100 && statusCode < 600 ? statusCode : 500)
    .json({
      statusCode: statusCode || statusCode.ERROR,
      message,
      data: error.data,
    });
};

export { createResponse, errorResponse, successResponse };
