import Joi from "joi";
import {
  JOI,
  ROLE,
  TAG_TYPE,
  editRoleSchema,
} from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const defaultComposition = {
  body: Joi.object().keys({
    compositionId: JOI.OBJECTID,
    duration: Joi.number().required(),
  }),
};

export const editProfile = {
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      profilePic: Joi.string().allow(""),
      phoneNumber: Joi.number(),
      countryCode: Joi.number(),
    })
    .required(),
};

export const editRole = {
  body: editRoleSchema.required(),
};

export const reports = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    page: JOI.PAGE,
    limit: JOI.LIMIT,
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    tags: Joi.array().items(Joi.string().allow("")).allow(""),
    groups: Joi.array().items(Joi.string().allow("")).allow(""),
  }),
};

export const addUser = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: JOI.EMAIL,
    password: JOI.PASSWORD,
    groups: Joi.array()
      .items(Joi.string().custom(objectId).allow(""))
      .default([]),
    role: Joi.string()
      .valid(...Object.values(ROLE))
      .required(),
  }),
};

export const editUser = {
  body: Joi.object().keys({
    userId: JOI.OBJECTID,
    name: Joi.string().required(),
    groups: Joi.array()
      .items(Joi.string().custom(objectId).allow(""))
      .default([]),
    role: Joi.string()
      .valid(...Object.values(ROLE))
      .required(),
  }),
};

export const deleteUser = {
  query: Joi.object().keys({
    userId: JOI.OBJECTID,
  }),
};

export const changePassword = {
  body: Joi.object().keys({
    userId: JOI.OBJECTID,
    password: JOI.PASSWORD,
  }),
};

export const disableUser = {
  body: Joi.object().keys({
    userId: JOI.OBJECTID,
  }),
};

export const addGroups = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
  }),
};

export const editGroup = {
  body: Joi.object().keys({
    groupId: JOI.OBJECTID,
    name: Joi.string().required(),
    description: Joi.string().required(),
  }),
};

export const deleteGroup = {
  query: Joi.object().keys({
    groupId: JOI.OBJECTID,
  }),
};

export const getTags = {
  query: Joi.object().keys({
    type: Joi.string()
      .valid("screens", "media", "composition", "schedule")
      .required(),
  }),
};

export const addTags = {
  body: Joi.object().keys({
    type: Joi.string()
      .valid(...Object.values(TAG_TYPE))
      .required(),
    id: JOI.OBJECTID,
    tags: Joi.array().items(Joi.string().required()).default([]),
  }),
};

export const addDeviceProfile = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    title: Joi.string().required(),
    type: Joi.string().required(),
    x: Joi.number().required(),
    y: Joi.number().required(),
    height: Joi.number().required(),
    width: Joi.number().required(),
    screenHealthIndicator: Joi.boolean().required().default(true),
    orientation: Joi.string().valid("landscape", "portrait").required(),
  }),
};

export const editDeviceProfile = {
  body: Joi.object().keys({
    profileId: JOI.OBJECTID,
    name: Joi.string().required(),
    title: Joi.string().required(),
    type: Joi.string().required(),
    x: Joi.number().required(),
    y: Joi.number().required(),
    height: Joi.number().required(),
    width: Joi.number().required(),
    screenHealthIndicator: Joi.boolean().required().default(true),
    orientation: Joi.string().valid("landscape", "portrait").required(),
  }),
};

export const deleteDeviceProfile = {
  query: Joi.object().keys({
    profileId: JOI.OBJECTID,
  }),
};

export const assign = {
  body: Joi.object().keys({
    profileId: JOI.OBJECTID,
    screens: Joi.array().items(JOI.OBJECTID).required(),
  }),
};

export const mfa = {
  body: Joi.object().keys({
    mfaEnabled: Joi.boolean().required(),
    mfa: Joi.string().allow(""),
  }),
};
