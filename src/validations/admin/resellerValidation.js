import Joi from "joi";
import { JOI } from "../../config/appConstants.js";

export const list = {
  query: Joi.object().keys({
    search: JOI.SEARCH,
    page: JOI.PAGE,
    limit: JOI.LIMIT,
  }),
};

export const getReseller = {
  query: Joi.object().keys({
    resellerId: JOI.OBJECTID,
  }),
};

export const addReseller = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: JOI.EMAIL,
    password: JOI.PASSWORD,
    clients: Joi.array().items(JOI.OBJECTID).allow(""),
  }),
};

export const editReseller = {
  body: Joi.object().keys({
    resellerId: JOI.OBJECTID,
    password: JOI.PASSWORD,
    clients: Joi.array().items(JOI.OBJECTID).allow(""),
  }),
};
