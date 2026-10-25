
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  getProfile,
  updateProfile,
  sendChangeEmailOtp,
  verifyChangeEmailOtp,
  changePassword,
} from "../controllers/userController.js";

const router = express.Router();

// Get the logged-in user's profile
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// Update profile details and upload a profile picture
router.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

// Send OTP to the new email address
router.post(
  "/change-email/send-otp",
  authMiddleware,
  sendChangeEmailOtp
);

// Verify OTP and change the email address
router.post(
  "/change-email/verify-otp",
  authMiddleware,
  verifyChangeEmailOtp
);

// Change the user's password
router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;
