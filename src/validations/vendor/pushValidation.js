import Joi from "joi";
import { JOI } from "../../config/appConstants.js";
import { objectId } from "../custom.validation.js";

export const schedules = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
  }),
};

export const getSchedule = {
  query: Joi.object().keys({
    scheduleId: JOI.OBJECTID,
  }),
};

export const addSchedule = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    screens: Joi.array().items(JOI.OBJECTID).required(),
    sequence: Joi.array()
      .items({
        name: Joi.string().required(),
        date: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        composition: JOI.OBJECTID,
      })
      .required(),
  }),
};

export const editSchedule = {
  body: Joi.object().keys({
    scheduleId: JOI.OBJECTID,
    name: Joi.string().required(),
    sequence: Joi.array()
      .items({
        name: Joi.string().required(),
        date: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        composition: JOI.OBJECTID,
      })
      .required(),
  }),
};
