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
    screens: Joi.array().items(JOI.OBJECTID),
  }),
};

export const editSchedule = {
  body: Joi.object().keys({
    scheduleId: JOI.OBJECTID,
    name: Joi.string().required(),
    screens: Joi.array().items(JOI.OBJECTID).required(),
  }),
};

export const addSequence = {
  body: Joi.object().keys({
    scheduleId: JOI.OBJECTID,
    name: Joi.string().required(),
    timings: Joi.array()
      .items({
        compositionId: JOI.OBJECTID,
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
      })
      .required(),
  }),
};

export const editSequence = {
  body: Joi.object().keys({
    scheduleId: JOI.OBJECTID,
    sequenceId: JOI.OBJECTID,
    name: Joi.string().required(),
    timings: Joi.array().items({
      compositionId: JOI.OBJECTID,
      startTime: Joi.date().required(),
      endTime: Joi.date().required(),
    }),
  }),
};

export const deleteSequence = {
  query: Joi.object().keys({
    scheduleId: JOI.OBJECTID,
    sequenceId: JOI.OBJECTID,
  }),
};
