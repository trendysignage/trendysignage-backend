import Joi from "joi";
import { JOI } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const addDevice = {
  body: Joi.object().keys({
    deviceToken: Joi.string().required(),
  }),
};