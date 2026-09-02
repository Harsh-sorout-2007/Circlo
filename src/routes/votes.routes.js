import { Router } from "express";
import { vote, removeVote } from "../controllers/vote.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, vote).delete(verifyJWT, removeVote);

export default router;
