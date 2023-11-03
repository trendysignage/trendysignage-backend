import Joi from "joi";
import { JOI, SCREEN_SETTINGS } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const deviceCode = {
  body: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

export const getScreens = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    page: Joi.number().allow("").default(0),
    limit: Joi.number().allow("").default(10),
    status: Joi.string().valid("live", "offline", "deactivated").allow(""),
    tags: Joi.array().items(Joi.string().allow("")).allow(""),
    groups: Joi.array()
      .items(Joi.string().custom(objectId).allow(""))
      .allow(""),
  }),
};

export const addScreen = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    name: Joi.string().required().trim(),
    screenLocation: Joi.string().required(),
    googleLocation: Joi.string().required(),
    tags: Joi.array().items(Joi.string().allow("")).allow(""),
  }),
};

export const editScreen = {
  body: Joi.object().keys({
    screenId: JOI.OBJECTID,
    name: Joi.string().required(),
    screenLocation: Joi.string().required(),
    googleLocation: Joi.string().required(),
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

export const changeDefaultComposition = {
  body: Joi.object().keys({
    screenId: JOI.OBJECTID,
    compositionId: JOI.OBJECTID,
    duration: Joi.number().required(),
  }),
};

export const getMedia = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    page: Joi.number().allow("").default(0),
    limit: Joi.number().allow(""),
    type: Joi.string().allow("").valid("image", "video", "apps", "pdf"),
    filterType: Joi.string().allow("").valid("image", "video", "apps", "pdf"),
    tags: Joi.array().items(Joi.string().allow("")).allow(""),
  }),
};

export const addMedia = {
  body: Joi.object().keys({
    type: Joi.string()
      // .valid(...Object.values(MEDIA_TYPE))
      .optional(),
    properties: Joi.string().required(),
    name: Joi.string().allow(""),
    duration: Joi.number().allow("").default(1),
    extension: Joi.string().optional(),
    base64String: Joi.string().optional(),
  }),
};

export const editMedia = {
  body: Joi.object().keys({
    mediaId: JOI.OBJECTID,
    properties: Joi.string().required(),
  }),
};

export const deleteMedia = {
  query: Joi.object().keys({
    mediaId: JOI.OBJECTID,
  }),
};

export const publish = {
  body: Joi.object().keys({
    id: JOI.OBJECTID,
    type: Joi.string().valid("media", "composition").required(),
    duration: Joi.number().default(60).min(60).required(),
    screenIds: Joi.array().items(JOI.OBJECTID).required(),
  }),
};

export const mediaFile = {
  query: Joi.object().keys({
    path: Joi.string().required(),
  }),
};

export const mediaDetail = {
  query: Joi.object().keys({
    mediaId: JOI.OBJECTID,
  }),
};

export const assignGroup = {
  body: Joi.object().keys({
    screenId: JOI.OBJECTID,
    groupIds: Joi.array()
      .items(Joi.string().custom(objectId).optional())
      .optional(),
  }),
};

export const settings = {
  body: Joi.object().keys({
    type: Joi.string()
      .valid(...Object.values(SCREEN_SETTINGS))
      .required(),
    screenId: JOI.OBJECTID,
  }),
};
