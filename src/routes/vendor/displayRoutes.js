const express = require("express");
const auth = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validate");
const { displayValidation } = require("../../validations");
const { displayController } = require("../../controllers");

const router = express.Router();

router
  .route("/screen")
  .all(auth())
  .post(validate(displayValidation.addScreen), displayController.addScreen)
  .delete(
    validate(displayValidation.deleteScreen),
    displayController.deleteScreen
  );

module.exports = router;
