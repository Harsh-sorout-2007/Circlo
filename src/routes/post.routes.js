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
  searchPosts,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { postValidator } from "../validators/post.validator.js";
import { searchValidator } from "../validators/search.validator.js";

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
  .route("/search")
  .get(verifyJWT, searchValidator(), validate, searchPosts);

router
  .route("/:postId")
  .get(verifyJWT, getPost)
  .patch(verifyJWT, updatePost)
  .delete(verifyJWT, deletePost);

export default router;
