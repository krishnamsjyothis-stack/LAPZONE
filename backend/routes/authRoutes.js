import express from "express";

import {
  signup,
  verifySignupOtp,
  login,
  googleLogin,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../controllers/authController.js";

import {
  userSchema,
  loginSchema,
} from "../middleware/validateUser.js";

const router = express.Router();

// ================= SIGNUP =================

router.post(
  "/signup",
  (req, res, next) => {
    const result = userSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    next();
  },
  signup
);

// ================= LOGIN =================

router.post(
  "/login",
  (req, res, next) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    next();
  },
  login
);

// ================= GOOGLE LOGIN =================

router.post(
  "/google",
  googleLogin
);

// ================= FORGOT PASSWORD =================

router.post(
  "/forgot-password",
  forgotPassword
);

// ================= VERIFY FORGOT PASSWORD OTP =================

router.post(
  "/forgot-password/verify-otp",
  verifyForgotPasswordOtp
);

// ================= RESET PASSWORD =================

router.post(
  "/reset-password",
  resetPassword
);

// ================= VERIFY SIGNUP OTP =================

router.post(
  "/signup/verify-otp",
  verifySignupOtp
);

export default router;