import express from "express";
import { appController } from "../../controllers/index.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { appValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/apps")
  .all(auth())
  .get(appController.getApps)
  .post(validate(appValidation.createApp), appController.createApp)
  .put(validate(appValidation.editApp), appController.editApp);

export default router;
