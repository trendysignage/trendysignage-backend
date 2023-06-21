import Joi from "joi";
import { JOI } from "../../config/appConstants.js";

export const getVendor = {
  query: Joi.object().keys({
    vendorId: JOI.OBJECTID,
  }),
};

export const addVendor = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: JOI.EMAIL,
    password: JOI.PASSWORD,
    screens: Joi.number().required(),
  }),
};

export const list = {
  query: Joi.object().keys({
    search: JOI.SEARCH,
    page: JOI.PAGE,
    limit: JOI.LIMIT,
  }),
};
