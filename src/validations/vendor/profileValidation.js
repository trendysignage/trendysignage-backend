import Joi from "joi";
import { JOI, ROLE, editRoleSchema } from "../../config/appConstants.js";
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
    page: JOI.PAGE,
    limit: JOI.LIMIT,
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
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
