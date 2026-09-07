import { Router } from "express";

import { commentValidator } from "../validators/comment.validator.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validator.middleware.js";

import { validateObjectId } from "../middlewares/validateObect.middleware.js";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router
  .route("/post/:postId")
  .post(
    verifyJWT,
    validateObjectId("postId"),
    commentValidator(),
    validate,
    createComment,
  )
  .get(verifyJWT, validateObjectId("postId"), getComments);

router
  .route("/post/:postId/:commentId")
  .patch(
    verifyJWT,
    validateObjectId("postId"),
    validateObjectId("commentId"),
    commentValidator(),
    validate,
    updateComment,
  )
  .delete(
    verifyJWT,
    validateObjectId("postId"),
    validateObjectId("commentId"),
    deleteComment,
  );

export default router;
