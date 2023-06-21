import Joi from "joi";
import { JOI } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

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
