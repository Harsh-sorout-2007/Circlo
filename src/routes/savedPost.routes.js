import { Router } from "express";

import {
  savePost,
  removeSavedPost,
  getSavedPost,
} from "../controllers/savedPost.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validateObect.middleware.js";
import { paginationValidator } from "../validators/pagination.validator.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router
  .route("/:postId")
  .post(verifyJWT, validateObjectId("postId"), savePost)
  .delete(verifyJWT, validateObjectId("postId"), removeSavedPost);

router.route("/").get(verifyJWT, paginationValidator(), validate, getSavedPost);

export default router;
