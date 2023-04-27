import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { layoutController } from "../../controllers/index.js";
import { layoutValidation } from "../../validations/index.js";
import upload from "../../middlewares/multer.js";

const router = express.Router();

router
  .route("/")
  .all(auth())
  .get(layoutController.layouts)
  .post(validate(layoutValidation.addLayout), layoutController.addLayout)
  .put(validate(layoutValidation.editLayout), layoutController.editLayout)
  .delete(
    validate(layoutValidation.deleteLayout),
    layoutController.deleteLayout
  );

router
  .route("/compositions")
  .all(auth())
  .get(
    validate(layoutValidation.getCompositions),
    layoutController.getCompositions
  )
  .post(
    validate(layoutValidation.addComposition),
    layoutController.addComposition
  );

export default router;
