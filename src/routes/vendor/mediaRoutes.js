import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { mediaController } from "../../controllers/index.js";
import { mediaValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/media")
  .all(auth())
  .post(validate(mediaValidation.addMedia), mediaController.addMedia);

export default router;
