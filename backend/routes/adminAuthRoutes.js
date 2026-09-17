import express from "express";

import adminLogin, {
  adminLogout,
} from "../controllers/adminAuthController.js";

const router = express.Router();



router.post("/login", adminLogin);


router.get("/session", (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      authenticated: false,
      message: "No active admin session",
    });
  }

  return res.status(200).json({
    authenticated: true,
    adminId: req.session.adminId,
    message: "Admin session is active",
  });
});



router.post("/logout", adminLogout);

export default router;