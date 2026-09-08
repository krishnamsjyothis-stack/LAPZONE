import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();


// GET PROFILE

router.get(
  "/profile",
  authMiddleware,
  getProfile
);


// UPDATE PROFILE

router.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);


export default router;