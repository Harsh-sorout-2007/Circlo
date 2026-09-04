import { Router } from "express";
import {
  getUserProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { userValidator } from "../validators/user.validator.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router
  .route("/update")
  .patch(verifyJWT, userValidator(), validate, updateProfile);

router.route("/:username").get(getUserProfile);

export default router;
