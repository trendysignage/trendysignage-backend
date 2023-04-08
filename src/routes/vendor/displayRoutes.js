import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { displayController } from "../../controllers/index.js";
import { displayValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/screen")
  .all(auth())
  .get(validate(displayValidation.getScreens), displayController.getScreens)
  .post(validate(displayValidation.addScreen), displayController.addScreen)
  .put(validate(displayValidation.editScreen), displayController.editScreen)
  .delete(
    validate(displayValidation.deleteScreen),
    displayController.deleteScreen
  );

export default router;
