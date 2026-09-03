import { Router } from "express";
import {
  createCommunityPost,
  createPersonalPost,
  updatePost,
  deletePost,
  getPost,
  getCommunityPosts,
  getPersonalPosts,
  getHomeFeed,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { postValidator } from "../validators/post.validator.js";

const router = Router();

router
  .route("/personal")
  .get(verifyJWT, getPersonalPosts)
  .post(verifyJWT, postValidator(), validate, createPersonalPost);

router
  .route("/community/:communityId")
  .post(verifyJWT, postValidator(), validate, createCommunityPost)
  .get(verifyJWT, getCommunityPosts);

router.route("/feed").get(verifyJWT, getHomeFeed);

router
  .route("/:postId")
  .get(verifyJWT, getPost)
  .patch(verifyJWT, updatePost)
  .delete(verifyJWT, deletePost);

export default router;
