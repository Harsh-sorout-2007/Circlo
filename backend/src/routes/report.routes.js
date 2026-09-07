import { Router } from "express";
import {
  createReport,
  getReports,
  updateReport,
} from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { reportValidator } from "../validators/report.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { validateObjectId } from "../middlewares/validateObect.middleware.js";
import { paginationValidator } from "../validators/pagination.validator.js";
const router = Router();

router.route("/").post(verifyJWT, reportValidator(), validate, createReport);

router
  .route("/community/:communityId")
  .get(
    verifyJWT,
    validateObjectId("communityId"),
    paginationValidator(),
    validate,
    getReports,
  );

router
  .route("/:reportId")
  .patch(verifyJWT, validateObjectId("reportId"), updateReport);

export default router;
