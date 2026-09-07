import { Router } from "express";
import {
  getUserProfile,
  updateProfile,
  searchUsers,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { searchValidator } from "../validators/search.validator.js";
import { userValidator } from "../validators/user.validator.js";
import { validate } from "../middlewares/validator.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/update")
  .patch(verifyJWT, upload.single("avatar"), userValidator(), validate, updateProfile);

router.route("/search").get(searchValidator(), validate, searchUsers);

router.route("/:username").get(getUserProfile);

export default router;
