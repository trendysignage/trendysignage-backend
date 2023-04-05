const Joi = require("joi");
const { pick } = require("../utils/universalFunction");
const config = require("../config/config");
const { ValidationError } = require("../utils/errors");

const validate = (schema) => (req, res, next) => {
  try {
    const validSchema = pick(schema, ["params", "query", "body"]);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: "key" } })
      .validate(object);
    if (error) {
      let errorMessage = error.details
        .map((details) => details.message)
        .join(", ")
        .replace(/"/g, "");
      console.error(errorMessage);
      return next(new ValidationError(errorMessage));
    }
    Object.assign(req, value);
    return next();
  } catch (err) {
    return res.send(err);
  }
};

const validateView = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" } })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return res.render("./commonMessage", {
      title: "Something went wrong",
      errorMessage,
      projectName: config.projectName,
    });
  }
  Object.assign(req, value);
  return next();
};

module.exports = { validate, validateView };
