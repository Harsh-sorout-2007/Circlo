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
import { validateObjectId } from "../middlewares/validateObect.middleware.js";
import { paginationValidator } from "../validators/pagination.validator.js";

const router = Router();

router
  .route("/personal")
  .get(verifyJWT, paginationValidator(), validate, getPersonalPosts)
  .post(verifyJWT, postValidator(), validate, createPersonalPost);

router
  .route("/community/:communityId")
  .post(
    verifyJWT,
    validateObjectId("communityId"),
    postValidator(),
    validate,
    createCommunityPost,
  )
  .get(
    verifyJWT,
    validateObjectId("communityId"),
    paginationValidator(),
    validate,
    getCommunityPosts,
  );

router
  .route("/feed")
  .get(verifyJWT, paginationValidator(), validate, getHomeFeed);

router
  .route("/search")
  .get(
    verifyJWT,
    paginationValidator(),
    searchValidator(),
    validate,
    searchPosts,
  );

router
  .route("/:postId")
  .get(verifyJWT, validateObjectId("postId"), getPost)
  .patch(verifyJWT, validateObjectId("postId"), updatePost)
  .delete(verifyJWT, validateObjectId("postId"), deletePost);

export default router;
