import express from "express";
import { profileController } from "../../controllers/index.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { profileValidation } from "../../validations/index.js";

const router = express.Router();

router.put(
  "/defaultComposition",
  auth(),
  validate(profileValidation.defaultComposition),
  profileController.defaultComposition
);

router
  .route("/")
  .all(auth())
  .get(profileController.getProfile)
  .put(validate(profileValidation.editProfile), profileController.editProfile);

router
  .route("/roles")
  .all(auth())
  .get(profileController.getRoles)
  .put(validate(profileValidation.editRole), profileController.editRole);

router.get(
  "/auditLogs",
  auth(),
  validate(profileValidation.reports),
  profileController.auditReport
);

router.get(
  "/uptimeReport",
  auth(),
  validate(profileValidation.reports),
  profileController.uptimeReport
);

// router.get(
//   "/mediaReport",
//   auth(),
//   validate(profileValidation.reports),
//   profileController.mediaReport
// );

router
  .route("/users")
  .all(auth())
  .get(profileController.getUsers)
  .post(validate(profileValidation.addUser), profileController.addUser);

export default router;
