import express from "express";
import {
  commonController,
  vendorAuthController,
} from "../../controllers/index.js";
import auth from "../../middlewares/auth.js";
import { validate, validateView } from "../../middlewares/validate.js";
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

router.put(
  "/changePassword",
  auth(),
  validate(vendorAuthValidation.changePassword),
  vendorAuthController.changePassword
);

router.post(
  "/forgotPassword",
  validate(vendorAuthValidation.forgotPassword),
  vendorAuthController.forgotPassword
);

router
  .route("/resetPassword")
  .get(
    validateView(vendorAuthValidation.forgotPage),
    vendorAuthController.forgotPage
  )
  .post(
    validateView(vendorAuthValidation.resetPassword),
    vendorAuthController.resetPassword
  );

router.get("/verifyResetPasswordToken", vendorAuthController.verifyToken);

export default router;
