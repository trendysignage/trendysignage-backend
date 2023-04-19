import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { profileController } from "../../controllers/index.js";
import { profileValidation } from "../../validations/index.js";
import upload from "../../middlewares/multer.js";

const router = express.Router();

router.put(
  "/defaultComposition",
  auth(),
  upload.single("file"),
  // validate(profileValidation.defaultComposition),
  profileController.defaultComposition
);

export default router;
