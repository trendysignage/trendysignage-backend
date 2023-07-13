import Joi from "joi";
import { JOI } from "../../config/appConstants.js";

export const schedules = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    page: JOI.PAGE,
    limit: JOI.LIMIT,
    tags: Joi.array().items(Joi.string().allow("")).allow(""),
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
        composition: JOI.OBJECTID,
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
      composition: JOI.OBJECTID,
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

export const dates = {
  body: Joi.object().keys({
    scheduleId: JOI.OBJECTID,
    scheduleArray: Joi.array().items({
      sequenceId: JOI.OBJECTID,
      dates: Joi.array().items(Joi.date().required()).required(),
    }),
  }),
};

export const getQuickplay = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    page: JOI.PAGE,
    limit: JOI.LIMIT,
  }),
};

export const addQuickplay = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    compositionId: JOI.OBJECTID,
    duration: Joi.number().required().default(600),
    screens: Joi.array().items(JOI.OBJECTID).required(),
    tags: Joi.array().items(Joi.string().allow("")).default([]),
  }),
};

export const deleteQuickplay = {
  query: Joi.object().keys({
    id: JOI.OBJECTID,
  }),
};
