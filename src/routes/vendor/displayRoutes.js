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

router
  .route("/media")
  .all(auth())
  .get(validate(displayValidation.getMedia), displayController.getMedia)
  .post(validate(displayValidation.addMedia), displayController.addMedia)
  .put(validate(displayValidation.editMedia), displayController.editMedia)
  .delete(
    validate(displayValidation.deleteMedia),
    displayController.deleteMedia
  );

export default router;
