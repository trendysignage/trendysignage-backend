import express from "express";
import { validate } from "../../middlewares/validate.js";
import { adminVendorController } from "../../controllers/index.js";
import { adminVendorValidation } from "../../validations/index.js";
import { USER_TYPE } from "../../config/appConstants.js";
import auth from "../../middlewares/auth.js";

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

export default router;