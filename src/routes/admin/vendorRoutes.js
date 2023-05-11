import express from "express";
import { validate } from "../../middlewares/validate.js";
import { adminVendorController } from "../../controllers/index.js";
import { adminAuthValidation } from "../../validations/index.js";
import { USER_TYPE } from "../../config/appConstants.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();



export default router;
