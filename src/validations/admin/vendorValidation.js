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

export const reports = {
  query: Joi.object().keys({
    vendorId: JOI.OBJECTID,
    search: Joi.string().allow(""),
    page: JOI.PAGE,
    limit: JOI.LIMIT,
    startDate: Joi.string().allow(""),
    endDate: Joi.string().allow(""),
    tags: Joi.array().items(Joi.string().allow("")).allow(""),
    groups: Joi.array().items(Joi.string().allow("")).allow(""),
  }),
};

export const getScreen = {
  query: Joi.object().keys({
    screenId: JOI.OBJECTID,
  }),
};
