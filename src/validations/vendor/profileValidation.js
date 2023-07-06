import Joi from "joi";
import { JOI, editRoleSchema } from "../../config/appConstants.js";

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
