import { Router } from "express";

import {
  createCommunity,
  getCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updateMemberRole,
  removeMember,
  getCommunityByName,
  banMember,
  unbanMember,
  getAllCommunities,
  searchCommunities,
} from "../controllers/community.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { communityValidator } from "../validators/index.js";
import { validateObjectId } from "../middlewares/validateObect.middleware.js";
import { paginationValidator } from "../validators/pagination.validator.js";

import { searchValidator } from "../validators/search.validator.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(optionalVerifyJWT, paginationValidator(), validate, getAllCommunities);

router.route("/search").get(paginationValidator(), searchValidator(), validate, searchCommunities);

router
  .route("/create-community")
  .post(verifyJWT, communityValidator(), validate, createCommunity);

router
  .route("/id/:communityId")
  .get(optionalVerifyJWT, validateObjectId("communityId"), getCommunity)
  .patch(
    verifyJWT,
    validateObjectId("communityId"),
    upload.fields([{ name: "icon", maxCount: 1 }, { name: "banner", maxCount: 1 }]),
    updateCommunity
  )
  .delete(verifyJWT, validateObjectId("communityId"), deleteCommunity);

router.route("/:communityName").get(getCommunityByName);

router
  .route("/:communityId/join")
  .post(verifyJWT, validateObjectId("communityId"), joinCommunity);

router
  .route("/:communityId/leave")
  .post(verifyJWT, validateObjectId("communityId"), leaveCommunity);

router
  .route("/:communityId/members")
  .get(
    verifyJWT,
    validateObjectId("communityId"),
    paginationValidator(),
    validate,
    getCommunityMembers,
  );

router
  .route("/:communityId/members/:userId/ban")
  .patch(
    verifyJWT,
    validateObjectId("communityId"),
    validateObjectId("userId"),
    banMember,
  );

router
  .route("/:communityId/members/:userId/unban")
  .patch(
    verifyJWT,
    validateObjectId("communityId"),
    validateObjectId("userId"),
    unbanMember,
  );

router
  .route("/:communityId/:userId/role")
  .patch(
    verifyJWT,
    validateObjectId("communityId"),
    validateObjectId("userId"),
    updateMemberRole,
  );

router
  .route("/:communityId/:userId")
  .delete(
    verifyJWT,
    validateObjectId("communityId"),
    validateObjectId("userId"),
    removeMember,
  );

export default router;
// trigger nodemon
