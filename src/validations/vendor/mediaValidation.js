import Joi from "joi";
import { JOI } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const addMedia = {
  body: Joi.object().keys({}),
};
