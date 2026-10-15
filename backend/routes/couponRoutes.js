import express from "express";

import {
  createCoupon,
  getCoupons,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// ADMIN COUPON MANAGEMENT
// ==========================================

// Get all coupons
router.get(
  "/",
  adminMiddleware,
  getCoupons
);

// Create coupon
router.post(
  "/",
  adminMiddleware,
  createCoupon
);

// Delete coupon
router.delete(
  "/:id",
  adminMiddleware,
  deleteCoupon
);

// ==========================================
// USER COUPON VALIDATION
// ==========================================

// Validate/apply coupon at checkout
router.post(
  "/validate",
  authMiddleware,
  validateCoupon
);

export default router;