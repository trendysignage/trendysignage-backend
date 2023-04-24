import Joi from "joi";
import { JOI, MEDIA_TYPE } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const deviceCode = {
  body: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

export const getScreens = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
  }),
};

export const addScreen = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    name: Joi.string().required().trim(),
    screenLocation: Joi.string().required(),
    googleLocation: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).default([]),
    groups: Joi.array().items(Joi.string().required()).default([]),
  }),
};

export const editScreen = {
  body: Joi.object().keys({
    screenId: JOI.OBJECTID,
    name: Joi.string().required(),
    screenLocation: Joi.string().required(),
    googleLocation: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).default([]),
    groups: Joi.array().items(Joi.string().required()).default([]),
  }),
};

export const deleteScreen = {
  query: Joi.object().keys({
    screenId: JOI.OBJECTID,
  }),
};

export const getScreen = {
  query: Joi.object().keys({
    screenId: JOI.OBJECTID,
  }),
};

export const getMedia = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    page: Joi.number().allow("").default(0),
    limit: Joi.number().allow("").default(10),
  }),
};

export const addMedia = {
  body: Joi.object().keys({
    type: Joi.string()
      .valid(...Object.values(MEDIA_TYPE))
      .required(),
    properties: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).default([]),
  }),
};

export const editMedia = {
  body: Joi.object().keys({
    mediaId: JOI.OBJECTID,
    properties: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).default([]),
  }),
};

export const deleteMedia = {
  query: Joi.object().keys({
    mediaId: JOI.OBJECTID,
  }),
};

export const publish = {
  body: Joi.object().keys({
    mediaId: JOI.OBJECTID,
    duration: Joi.number().default(1).min(1).required(),
    screenIds: Joi.array().items(JOI.OBJECTID).required(),
  }),
};
