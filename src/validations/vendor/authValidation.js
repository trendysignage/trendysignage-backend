import Joi from "joi";
import { JOI } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const login = {
  body: Joi.object().keys({
    role: JOI.ROLE,
    email: Joi.string().email().lowercase().trim().required(),
    password: JOI.PASSWORD,
    // deviceToken: Joi.string().required(),
  }),
};

export const signup = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    role: JOI.ROLE,
    email: Joi.string().email().lowercase().trim().required(),
    password: JOI.PASSWORD,
    // deviceToken: Joi.string().required(),
  }),
};

export const verify = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
  }),
};
