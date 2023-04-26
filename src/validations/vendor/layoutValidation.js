import Joi from "joi";
import { JOI, MEDIA_TYPE } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const addLayout = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    screenType: Joi.string().required(),
    screenResolution: Joi.string().required(),
    zones: Joi.array()
      .items({
        name: Joi.string().required(),
        x: Joi.number().required(),
        y: Joi.number().required(),
        height: Joi.number().required(),
        width: Joi.number().required(),
        content: Joi.any().allow(""),
      })
      .required(),
  }),
};

export const deleteLayout = {
  query: Joi.object().keys({
    layoutId: JOI.OBJECTID,
  }),
};
