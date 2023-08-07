import express from "express";
import { USER_TYPE } from "../../config/appConstants.js";
import { adminVendorController } from "../../controllers/index.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { adminVendorValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/")
  .all(auth(USER_TYPE.ADMIN))
  .get(
    validate(adminVendorValidation.getVendor),
    adminVendorController.getVendor
  )
  .post(
    validate(adminVendorValidation.addVendor),
    adminVendorController.addVendor
  )
  .delete(
    validate(adminVendorValidation.getVendor),
    adminVendorController.deleteVendor
  );

router.get(
  "/list",
  auth(USER_TYPE.ADMIN),
  validate(adminVendorValidation.list),
  adminVendorController.list
);

router.get(
  "/mediaReport",
  auth(USER_TYPE.ADMIN),
  validate(adminVendorValidation.reports),
  adminVendorController.mediaReport
);

router.get(
  "/uptimeReport",
  auth(USER_TYPE.ADMIN),
  validate(adminVendorValidation.reports),
  adminVendorController.uptimeReport
);

router.get(
  "/auditLogs",
  auth(USER_TYPE.ADMIN),
  validate(adminVendorValidation.reports),
  adminVendorController.auditReport
);

router
  .route("/screen")
  .all(auth(USER_TYPE.ADMIN))
  .get(
    validate(adminVendorValidation.getScreen),
    adminVendorController.getScreen
  );

export default router;
