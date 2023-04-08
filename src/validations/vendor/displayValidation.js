import Joi from "joi";
import { JOI } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const getScreens = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
  }),
};

export const addScreen = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    screenLocation: Joi.string().required(),
    googleLocation: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).default([]),
  }),
};

export const editScreen = {
  body: Joi.object().keys({
    screenId: JOI.OBJECTID,
    name: Joi.string().required(),
    screenLocation: Joi.string().required(),
    googleLocation: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).required().default([]),
  }),
};

export const deleteScreen = {
  query: Joi.object().keys({
    screenId: JOI.OBJECTID,
  }),
};

export const addMedia = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    properties: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).default([]),
  }),
};
