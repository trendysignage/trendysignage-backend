const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");

const { NotFoundError } = require("../utils/errors");
const { errorResponse } = require("../utils/response");
const { ERROR_MESSAGES, STATUS_CODES } = require("../config/appConstants");

const errorHandler = (error, req, res, next) => {
  return errorResponse(error, req, res);
};

const routeNotFoundHandler = (req, res, next) => {
 
  return errorResponse(
    new NotFoundError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND),
    req,
    res
  );
};

const requestHandler = (req, res, next) => {
  //@ts-ignore
  req["reqId"] = uuidv4();
  //  Setting Language incase a header come
  res.setLocale(req.get("languageCode") || "en");
  next();
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

module.exports = {
  errorHandler,
  routeNotFoundHandler,
  requestHandler,
  authLimiter,
};
