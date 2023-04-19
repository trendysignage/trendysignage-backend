import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { profileController } from "../../controllers/index.js";
import { profileValidation } from "../../validations/index.js";

const router = express.Router();

router.put(
  "/defaultComposition",
  auth(),
  validate(profileValidation.defaultComposition),
  profileController.defaultComposition
);

export default router;
