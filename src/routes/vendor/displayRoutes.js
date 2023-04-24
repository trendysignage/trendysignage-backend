import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { displayController } from "../../controllers/index.js";
import { displayValidation } from "../../validations/index.js";
import upload from "../../middlewares/multer.js";

const router = express.Router();

router.post(
  "/deviceCode",
  auth(),
  validate(displayValidation.deviceCode),
  displayController.deviceCode
);

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

router.get(
  "/ss",
  auth(),
  validate(displayValidation.getScreen),
  displayController.getScreen
);

router
  .route("/media")
  .all(auth())
  .get(validate(displayValidation.getMedia), displayController.getMedia)
  .post(
    upload.single("file"),
    validate(displayValidation.addMedia),
    displayController.addMedia
  )
  .put(
    upload.single("file"),
    validate(displayValidation.editMedia),
    displayController.editMedia
  )
  .delete(
    validate(displayValidation.deleteMedia),
    displayController.deleteMedia
  );

router.post(
  "/publish",
  auth(),
  validate(displayValidation.publish),
  displayController.publish
);

export default router;
