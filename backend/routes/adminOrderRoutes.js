import express from "express";

import {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  getReturnRequests,
  updateReturnStatus,
} from "../controllers/adminOrderController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET ALL ORDERS
router.get("/", adminMiddleware, getAllOrders);

// GET RETURN REQUESTS
router.get("/returns", adminMiddleware, getReturnRequests);

// UPDATE RETURN STATUS
router.patch("/returns/:id", adminMiddleware, updateReturnStatus);

// GET ONE ORDER
router.get("/:id", adminMiddleware, getAdminOrderById);

// UPDATE ORDER STATUS
router.patch("/:id/status", adminMiddleware, updateOrderStatus);

export default router;