import Joi from "joi";
import { JOI } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const getVendor = {
  query: Joi.object().keys({
    vendorId: JOI.OBJECTID,
  }),
};

export const list = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    page: JOI.PAGE,
    Limit: JOI.LIMIT,
  }),
};
