import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getProfile,
  updateProfile,
  sendChangeEmailOtp,
  verifyChangeEmailOtp,
  changePassword,
} from "../controllers/userController.js";


import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get(
  "/profile",
  authMiddleware,
  getProfile
);


router.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

router.post(
  "/change-email/send-otp",
  authMiddleware,
  sendChangeEmailOtp
);
router.post(
  "/change-email/verify-otp",
  authMiddleware,
  verifyChangeEmailOtp
);
router.get("/profile", authMiddleware, getProfile);

router.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

router.post(
  "/change-email/send-otp",
  authMiddleware,
  sendChangeEmailOtp
);

router.post(
  "/change-email/verify-otp",
  authMiddleware,
  verifyChangeEmailOtp
);

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;