const Joi = require("joi");
const { JOI, DEVICE_TYPE } = require("../../config/appConstants");
const { objectId } = require("../custom.validation");

exports.addScreen = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    screenLocation: Joi.string().required(),
    googleLocation: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).default([]),
  }),
};
