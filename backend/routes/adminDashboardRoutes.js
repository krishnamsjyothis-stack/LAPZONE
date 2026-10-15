import express from "express";

import {
  getAdminDashboard,
} from "../controllers/adminDashboardController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", adminMiddleware, getAdminDashboard);

export default router;