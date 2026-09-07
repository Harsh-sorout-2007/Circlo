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
  getUserPosts,
} from "../controllers/post.controller.js";

import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { postValidator } from "../validators/post.validator.js";
import { searchValidator } from "../validators/search.validator.js";
import { validateObjectId } from "../middlewares/validateObect.middleware.js";
import { paginationValidator } from "../validators/pagination.validator.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/personal")
  .get(verifyJWT, paginationValidator(), validate, getPersonalPosts)
  .post(
    verifyJWT,
    upload.single("media"),
    postValidator(),
    validate,
    createPersonalPost,
  );

router
  .route("/community/:communityId")
  .post(
    verifyJWT,
    validateObjectId("communityId"),
    upload.single("media"),
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
  .route("/user/:username")
  .get(optionalVerifyJWT, paginationValidator(), validate, getUserPosts);

router
  .route("/:postId")
  .get(verifyJWT, validateObjectId("postId"), getPost)
  .patch(
    verifyJWT,
    validateObjectId("postId"),
    upload.single("media"),
    updatePost,
  )
  .delete(verifyJWT, validateObjectId("postId"), deletePost);

export default router;
