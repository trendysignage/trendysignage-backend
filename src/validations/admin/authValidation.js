import Joi from "joi";
import { JOI, USER_TYPE } from "../../config/appConstants.js";

export const login = {
  body: Joi.object().keys({
    email: JOI.EMAIL,
    password: JOI.PASSWORD,
    role: Joi.string()
      .valid(...Object.values(USER_TYPE))
      .default(USER_TYPE.ADMIN),
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
