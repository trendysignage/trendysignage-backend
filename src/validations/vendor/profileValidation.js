import Joi from "joi";
import { JOI, MEDIA_TYPE } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const defaultComposition = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    duration: Joi.string().required(),
    type: Joi.string()
      .values(...Object.values(MEDIA_TYPE))
      .required(),
  }),
};
