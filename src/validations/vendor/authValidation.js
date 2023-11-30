import Joi from "joi";
import { JOI } from "../../config/appConstants.js";

export const login = {
  body: Joi.object().keys({
    role: JOI.ROLE,
    email: JOI.EMAIL,
    password: JOI.PASSWORD,
    // deviceToken: Joi.string().required(),
  }),
};

export const signup = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    role: JOI.ROLE,
    email: JOI.EMAIL,
    password: JOI.PASSWORD,
    // deviceToken: Joi.string().required(),
  }),
};

export const verify = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
  }),
};

export const socialLogin = {
  body: Joi.object().keys({
    name: Joi.string().allow(""),
    email: JOI.EMAIL,
    socialId: Joi.string().required(),
  }),
};

export const forgotPassword = {
  body: Joi.object().keys({
    email: JOI.EMAIL,
  }),
};

export const forgotPage = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export const resetPassword = {
  body: Joi.object().keys({
    password: JOI.PASSWORD,
    confirmPassword: JOI.PASSWORD,
  }),
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export const changePassword = {
  body: Joi.object().keys({
    oldPassword: JOI.PASSWORD,
    newPassword: JOI.PASSWORD,
  }),
};
