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

router
  .route("/sequence")
  .all(auth())
  .get(validate(pushValidation.deleteSequence), pushController.getSequence)
  .post(validate(pushValidation.addSequence), pushController.addSequence)
  .put(validate(pushValidation.editSequence), pushController.editSequence)
  .delete(
    validate(pushValidation.deleteSequence),
    pushController.deleteSequence
  );

router.post(
  "/dates",
  auth(),
  validate(pushValidation.dates),
  pushController.dates
);

export default router;
