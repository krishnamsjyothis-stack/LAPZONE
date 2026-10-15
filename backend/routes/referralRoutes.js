import express from "express";

import {
  createReferral,
  getMyReferrals,
  getReferralByCode,
} from "../controllers/referralController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create referral
router.post("/", authMiddleware, createReferral);

// Get logged-in user's referrals
router.get("/my", authMiddleware, getMyReferrals);

// Get referral by code
router.get("/code/:code", getReferralByCode);

export default router;