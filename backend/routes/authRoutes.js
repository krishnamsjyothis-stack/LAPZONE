import express from "express";

import {
  signup,
  verifySignupOtp,
  login,
  googleLogin,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  logout,
} from "../controllers/authController.js";

import {
  userSchema,
  loginSchema,
} from "../middleware/validateUser.js";

const router = express.Router();


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



router.post(
  "/signup/verify-otp",
  verifySignupOtp
);


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



router.get("/session", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      authenticated: false,
      message: "No active session",
    });
  }

  return res.status(200).json({
    authenticated: true,
    userId: req.session.userId,
    message: "Session is active",
  });
});


router.post(
  "/logout",
  logout
);



router.post(
  "/google",
  googleLogin
);


router.post(
  "/forgot-password",
  forgotPassword
);



router.post(
  "/forgot-password/verify-otp",
  verifyForgotPasswordOtp
);


router.post(
  "/reset-password",
  resetPassword
);

export default router;