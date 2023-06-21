import { rateLimit } from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import { ERROR_MESSAGES, STATUS_CODES } from "../config/appConstants.js";
import { NotFoundError } from "../utils/errors.js";
import { errorResponse } from "../utils/response.js";

export const errorHandler = (error, req, res, next) => {
  return errorResponse(error, req, res);
};

export const routeNotFoundHandler = (req, res, next) => {
  return errorResponse(
    new NotFoundError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND),
    req,
    res
  );
};

export const requestHandler = (req, res, next) => {
  //@ts-ignore
  req["reqId"] = uuidv4();
  //  Setting Language incase a header come
  res.setLocale(req.get("languageCode") || "en");
  next();
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});
