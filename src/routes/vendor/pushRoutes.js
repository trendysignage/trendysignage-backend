import express from "express";
import { validate } from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { pushController } from "../../controllers/index.js";
import { pushValidation } from "../../validations/index.js";

const router = express.Router();

router
  .route("/schedules")
  .all(auth())
  .get(validate(pushValidation.schedules), pushController.schedules);

router
  .route("/schedule")
  .all(auth())
  .get(validate(pushValidation.getSchedule), pushController.getSchedule)
  .post(validate(pushValidation.addSchedule), pushController.addSchedule)
  .put(validate(pushValidation.editSchedule), pushController.editSchedule)
  .delete(validate(pushValidation.getSchedule), pushController.deleteSchedule);

export default router;
