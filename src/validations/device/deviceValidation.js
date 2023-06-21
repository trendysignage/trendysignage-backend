import Joi from "joi";

export const addDevice = {
  body: Joi.object().keys({
    deviceToken: Joi.string().required(),
  }),
};
