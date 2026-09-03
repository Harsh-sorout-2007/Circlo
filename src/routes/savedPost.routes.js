import { Router } from "express";
import {
  savePost,
  removeSavedPost,
  getSavedPost,
} from "../controllers/savedPost.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/:postId")
  .post(verifyJWT, savePost)
  .delete(verifyJWT, removeSavedPost);
router.route("/").get(verifyJWT, getSavedPost);

export default router;
