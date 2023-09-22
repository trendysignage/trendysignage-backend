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

router.get(
  "/mediaReport",
  auth(),
  validate(profileValidation.reports),
  profileController.mediaReport
);

router
  .route("/users")
  .all(auth())
  .get(profileController.getUsers)
  .post(validate(profileValidation.addUser), profileController.addUser)
  .put(validate(profileValidation.editUser), profileController.editUser)
  .delete(validate(profileValidation.deleteUser), profileController.deleteUser);

router.put(
  "/changeUserPassword",
  auth(),
  validate(profileValidation.changePassword),
  profileController.changePassword
);

router.put(
  "/diableUser",
  auth(),
  validate(profileValidation.disableUser),
  profileController.disableUser
);

router
  .route("/groups")
  .all(auth())
  .get(profileController.getGroups)
  .post(validate(profileValidation.addGroups), profileController.addGroups)
  .put(validate(profileValidation.editGroup), profileController.editGroups)
  .delete(
    validate(profileValidation.deleteGroup),
    profileController.deleteGroup
  );

router
  .route("/tags")
  .all(auth())
  .post(validate(profileValidation.addTags), profileController.addTags);

router
  .route("/deviceProfile")
  .all(auth())
  .get(profileController.getDeviceProfiles)
  .post(
    validate(profileValidation.addDeviceProfile),
    profileController.addDeviceProfile
  )
  .put(
    validate(profileValidation.editDeviceProfile),
    profileController.editDeviceProfile
  )
  .delete(
    validate(profileValidation.deleteDeviceProfile),
    profileController.deleteDeviceProfile
  );

router.post(
  "/assign",
  auth(),
  validate(profileValidation.assign),
  profileController.assign
);

router.get("/vendorRole", auth(), profileController.getVendorRole);

router
  .route("/mfa")
  .all(auth())
  .post(validate(profileValidation.mfa), profileController.mfa);

export default router;
