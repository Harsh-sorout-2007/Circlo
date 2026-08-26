import { Router } from "express";
import { community } from "../controllers/community.controller.js";

const router = Router();

router.route("/").post(community);

export default router;
