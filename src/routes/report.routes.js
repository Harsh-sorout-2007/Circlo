import { Router } from "express";
import {
  createReport,
  getReports,
  updateReport,
} from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { reportValidator } from "../validators/report.validator.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, reportValidator(), validate, createReport);
router.route("/community/:communityId").get(verifyJWT, getReports);
router.route("/:reportId").patch(verifyJWT, updateReport);

export default router;
