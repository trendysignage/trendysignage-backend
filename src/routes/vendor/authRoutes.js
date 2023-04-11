import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { vendorAuthController } from "../../controllers/index.js";
import { vendorAuthValidation } from "../../validations/index.js";

const router = express.Router();

router.post(
  "/login",
  validate(vendorAuthValidation.login),
  vendorAuthController.login
);

export default router;
