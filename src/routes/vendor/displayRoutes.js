import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { displayController } from "../../controllers/index.js";
import { displayValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/screen")
  .all(auth())
  .post(validate(displayValidation.addScreen), displayController.addScreen);

export default router;
