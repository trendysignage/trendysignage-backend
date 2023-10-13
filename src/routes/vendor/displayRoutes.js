import express from "express";
import { displayController } from "../../controllers/index.js";
import auth from "../../middlewares/auth.js";
import upload from "../../middlewares/multer.js";
import { validate } from "../../middlewares/validate.js";
import { displayValidation } from "../../validations/index.js";

const router = express.Router();

router.post(
  "/deviceCode",
  auth(),
  validate(displayValidation.deviceCode),
  displayController.deviceCode
);

router
  .route("/screen")
  .all(auth())
  .get(validate(displayValidation.getScreens), displayController.getScreens)
  .post(validate(displayValidation.addScreen), displayController.addScreen)
  .put(validate(displayValidation.editScreen), displayController.editScreen)
  .delete(
    validate(displayValidation.deleteScreen),
    displayController.deleteScreen
  );

router.get(
  "/screenDetails",
  auth(),
  validate(displayValidation.getScreen),
  displayController.getScreen
);

router.put(
  "/defaultComposition",
  auth(),
  validate(displayValidation.changeDefaultComposition),
  displayController.changeDefaultComposition
);

router
  .route("/media")
  // .all(auth())
  .get(validate(displayValidation.getMedia), displayController.getMedia)
  .post(
    upload.single("file"),
    validate(displayValidation.addMedia),
    displayController.addMedia
  )
  .patch(
    validate(displayValidation.addMedia),
    displayController.addMediaBase64
  )

  .put(
    upload.single("file"),
    validate(displayValidation.editMedia),
    displayController.editMedia
  )
  .delete(
    validate(displayValidation.deleteMedia),
    displayController.deleteMedia
  );

router.post(
  "/publish",
  auth(),
  validate(displayValidation.publish),
  displayController.publish
);

router.get(
  "/mediaFile",
  validate(displayValidation.mediaFile),
  displayController.mediaFile
);

router.get(
  "/media/detail",
  auth(),
  validate(displayValidation.mediaDetail),
  displayController.mediaDetail
);

router
  .route("/assignGroups")
  .all(auth())
  .put(validate(displayValidation.assignGroup), displayController.assignGroup);



export default router;
