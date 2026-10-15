
import express from "express";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

import {
  getAdminReviews,
  updateReviewStatus,
  deleteAdminReview,
} from "../controllers/adminReviewController.js";

const router = express.Router();

// Every route requires an authenticated admin session.
router.use(adminAuthMiddleware);

router.get("/", getAdminReviews);
router.patch("/:id/status", updateReviewStatus);
router.delete("/:id", deleteAdminReview);

export default router;
