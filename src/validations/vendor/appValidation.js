import Joi from "joi";
import { JOI } from "../../config/appConstants.js";

export const createApp = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().required(),
    data: Joi.string().required(),
    url: Joi.string().required(),
  }),
};

export const editApp = {
  body: Joi.object().keys({
    appId: JOI.OBJECTID,
    name: Joi.string().required(),
    type: Joi.string().required(),
    data: Joi.string().required(),
    url: Joi.string().required(),
    tags: Joi.array().items(Joi.string().allow("")).allow(""),
  }),
};
