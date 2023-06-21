import Joi from "joi";
import { JOI, editRoleSchema } from "../../config/appConstants.js";

export const defaultComposition = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    duration: Joi.number().required(),
    type: Joi.string()
      // .valid(...Object.values(MEDIA_TYPE))
      .required(),
  }),
};

export const editProfile = {
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      profilePic: Joi.string().required(),
      phoneNumber: Joi.number(),
      countryCode: Joi.number(),
    })
    .required(),
};

export const editRole = {
  body: editRoleSchema.required(),
};

export const auditReport = {
  query: Joi.object().keys({
    page: JOI.PAGE,
    limit: JOI.LIMIT,
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }),
};
