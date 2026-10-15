
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// Public: only approved reviews are returned.
router.get("/product/:productId", getProductReviews);

// Logged-in customer routes.
router.post("/", authMiddleware, createReview);
router.get("/my-reviews", authMiddleware, getMyReviews);
router.patch("/:id", authMiddleware, updateMyReview);
router.delete("/:id", authMiddleware, deleteMyReview);

export default router;
