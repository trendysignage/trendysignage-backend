import express from "express";
import { USER_TYPE } from "../../config/appConstants.js";
import { adminResellerController } from "../../controllers/index.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { adminResellerValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/list")
  .all(auth(USER_TYPE.ADMIN))
  .get(validate(adminResellerValidation.list), adminResellerController.list);

router
  .route("/")
  .all(auth(USER_TYPE.ADMIN))
  .get(
    validate(adminResellerValidation.getReseller),
    adminResellerController.getReseller
  )
  .post(
    validate(adminResellerValidation.addReseller),
    adminResellerController.addReseller
  )
  .put(
    validate(adminResellerValidation.editReseller),
    adminResellerController.editReseller
  )
  .delete(
    validate(adminResellerValidation.getReseller),
    adminResellerController.deleteReseller
  );

export default router;
