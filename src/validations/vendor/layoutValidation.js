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

export const editLayout = {
  body: Joi.object().keys({
    layoutId: JOI.OBJECTID,
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

export const getComposition = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    page: Joi.number().allow("").default(0),
    limit: Joi.number().allow("").default(10),
  }),
};

export const addComposition = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    layoutId: JOI.OBJECTID,
    zones: Joi.array()
      .items({
        name: Joi.string().required(),
        content: Joi.array().items({
          url: Joi.string().required(),
          type: Joi.string()
            .valid(...Object.values(MEDIA_TYPE))
            .required(),
          maintainAspectRatio: Joi.boolean().required().default(false),
          fitToScreen: Joi.boolean().required().default(true),
          crop: Joi.boolean().required().default(false),
          duration: Joi.number().required(),
        }),
      })
      .required(),
    duration: Joi.number().required(),
    referenceUrl: Joi.array().items(Joi.string().required()).required(),
  }),
};
