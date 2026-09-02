import { Router } from "express";
import { commentValidator } from "../validators/comment.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createComment,
  getComments,
} from "../controllers/comment.controller.js";

const router = Router();

router
  .route("/post/:postId")
  .post(verifyJWT, commentValidator(), validate, createComment)
  .get(verifyJWT, getComments);

export default router;
