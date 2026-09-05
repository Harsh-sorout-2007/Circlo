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
} from "../controllers/community.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { communityValidator } from "../validators/index.js";

const router = Router();

router
  .route("/create-community")
  .post(verifyJWT, communityValidator(), validate, createCommunity);

router
  .route("/id/:communityId")
  .get(verifyJWT, getCommunity)
  .patch(verifyJWT, updateCommunity)
  .delete(verifyJWT, deleteCommunity);

router.route("/:communityName").get(getCommunityByName);

router.route("/:communityId/join").post(verifyJWT, joinCommunity);
router.route("/:communityId/leave").post(verifyJWT, leaveCommunity);
router.route("/:communityId/members").get(verifyJWT, getCommunityMembers);
router.route("/:communityId/members/:userId/ban").patch(verifyJWT, banMember);
router.route("/:communityId/members/:userId/unban").patch(verifyJWT, unbanMember);
router.route("/:communityId/:userId/role").patch(verifyJWT, updateMemberRole);
router.route("/:communityId/:userId").delete(verifyJWT, removeMember);

export default router;
