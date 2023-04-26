import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { layoutController } from "../../controllers/index.js";
import { layoutValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/layouts")
  .all(auth())
  .get(layoutController.layouts)
  .post(validate(layoutValidation.addLayout), layoutController.addLayout)
  .delete(
    validate(layoutValidation.deleteLayout),
    layoutController.deleteLayout
  );

export default router;
