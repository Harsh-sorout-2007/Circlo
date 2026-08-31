import { Router } from "express";
import {
  createCommunityPost,
  createPersonalPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { postValidator } from "../validators/post.validator.js";

const router = Router();

router
  .route("/personal")
  .post(verifyJWT, postValidator(), validate, createPersonalPost);
router
  .route("/community/:communityId")
  .post(verifyJWT, postValidator(), validate, createCommunityPost);

router
  .route("/:postId")
  .patch(verifyJWT, updatePost)
  .delete(verifyJWT, deletePost);

export default router;
