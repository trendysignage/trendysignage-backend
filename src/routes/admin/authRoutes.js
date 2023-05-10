import express from "express";
import { validate } from "../../middlewares/validate.js";
import {
  adminAuthController,
  commonController,
} from "../../controllers/index.js";
import { adminAuthValidation } from "../../validations/index.js";
import { USER_TYPE } from "../../config/appConstants.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

router.post(
  "/login",
  validate(adminAuthValidation.login),
  adminAuthController.login
);

router.put(
  "/changePassword",
  auth(USER_TYPE.ADMIN),
  validate(adminAuthValidation.changePassword),
  adminAuthController.changePassword
);

router.post("/logout", auth(), commonController.logout);

export default router;
