import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { layoutController } from "../../controllers/index.js";
import { layoutValidation } from "../../validations/index.js";

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
  .route("/composition")
  .all(auth())
  .get(
    validate(layoutValidation.getComposition),
    layoutController.getComposition
  )
  .post(
    validate(layoutValidation.addComposition),
    layoutController.addComposition
  );

export default router;
