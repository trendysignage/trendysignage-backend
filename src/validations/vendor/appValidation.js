import Joi from "joi";
import { JOI } from "../../config/appConstants.js";

export const createApp = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().required(),
    data: Joi.string().required(),
    latitude: Joi.number().allow(""),
    longitude: Joi.number().allow(""),
  }),
};

export const editApp = {
  body: Joi.object().keys({
    appId: JOI.OBJECTID,
    name: Joi.string().required(),
    data: Joi.string().required(),
    latitude: Joi.number().allow(""),
    longitude: Joi.number().allow(""),
    tags: Joi.array().items(Joi.string().allow("")).allow(""),
  }),
};
