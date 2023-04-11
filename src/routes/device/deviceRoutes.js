import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { deviceController } from "../../controllers/index.js";
import { deviceValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/device")
  // .all(auth())
  .get(validate(deviceValidation.addDevice), deviceController.addDevice);
