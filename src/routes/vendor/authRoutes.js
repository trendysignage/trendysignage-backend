import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import {
  commonController,
  vendorAuthController,
} from "../../controllers/index.js";
import { vendorAuthValidation } from "../../validations/index.js";

const router = express.Router();

router.post(
  "/login",
  validate(vendorAuthValidation.login),
  vendorAuthController.login
);

router.post(
  "/signup",
  validate(vendorAuthValidation.signup),
  vendorAuthController.signup
);

router.post(
  "/verifyOtp",
  auth(),
  validate(vendorAuthValidation.verify),
  vendorAuthController.verify
);

router.post("/logout", auth(), commonController.logout);

router.post(
  "/forgotPassword",
  validate(vendorAuthValidation.forgotPassword),
  vendorAuthController.forgotPassword
);

export default router;
