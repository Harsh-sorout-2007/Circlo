import { Router } from "express";
import { vote, removeVote } from "../controllers/vote.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  voteValidator,
  removeVoteValidator,
} from "../validators/vote.validator.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, voteValidator(), validate, vote)
  .delete(verifyJWT, removeVoteValidator(), validate, removeVote);

export default router;
