import Joi from "joi";
import { JOI } from "../../config/appConstants.js";

export const login = {
  body: Joi.object().keys({
    email: JOI.EMAIL,
    password: JOI.PASSWORD,
  }),
};

export const changePassword = {
  body: Joi.object().keys({
    oldPassword: JOI.PASSWORD,
    newPassword: JOI.PASSWORD,
  }),
};

export const editMfa = {
  body: Joi.object().keys({
    mfaEnabled: Joi.boolean().required(),
    mfa: Joi.string().allow(""),
  }),
};
