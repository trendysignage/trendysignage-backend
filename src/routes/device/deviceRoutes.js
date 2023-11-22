import express from "express";
import { deviceController } from "../../controllers/index.js";
import { validate } from "../../middlewares/validate.js";
import { deviceValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/")
  .post(validate(deviceValidation.addDevice), deviceController.addDevice);

router
  .route("/add")
  .post(validate(deviceValidation.addDevice), deviceController.addDevice1);

// router
//   .route("/add1")
//   .post(validate(deviceValidation.addDevice), deviceController.addDev);

export default router;
