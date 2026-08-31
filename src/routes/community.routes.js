import { Router } from "express";
import {
  createCommunity,
  deleteCommunity,
} from "../controllers/community.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { communityValidator } from "../validators/index.js";

const router = Router();

router
  .route("/create-community")
  .post(verifyJWT, communityValidator(), validate, createCommunity);

router.route("/:communityId").delete(verifyJWT, deleteCommunity);
export default router;
