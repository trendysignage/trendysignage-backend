import express from "express";
import { pushController } from "../../controllers/index.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
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
  .route("/sequenceList")
  .all(auth())
  .get(validate(pushValidation.getSchedule), pushController.sequenceList);

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

router
  .route("/quickplay")
  .all(auth())
  .get(validate(pushValidation.getQuickplay), pushController.getQuickplay)
  .post(validate(pushValidation.addQuickplay), pushController.addQuickplay)
  .delete(
    validate(pushValidation.deleteQuickplay),
    pushController.deleteQuickplay
  );

export default router;
