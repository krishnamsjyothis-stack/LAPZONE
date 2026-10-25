import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  cancelOrderItem,
  requestReturn,
  downloadInvoice,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================================
// CREATE ORDER
// POST /api/orders
// =========================================

router.post(
  "/",
  authMiddleware,
  createOrder
);

// =========================================
// GET MY ORDERS
// GET /api/orders
// =========================================

router.get(
  "/",
  authMiddleware,
  getMyOrders
);

// =========================================
// GET SINGLE ORDER
// GET /api/orders/:id
// =========================================

router.get(
  "/:id",
  authMiddleware,
  getOrderById
);

// =========================================
// CANCEL ENTIRE ORDER
// PATCH /api/orders/:id/cancel
// =========================================

router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelOrder
);

// =========================================
// CANCEL SPECIFIC PRODUCT
// PATCH /api/orders/:id/items/:productId/cancel
// =========================================

router.patch(
  "/:id/items/:itemId/cancel",
  authMiddleware,
  cancelOrderItem
);

// =========================================
// REQUEST RETURN
// PATCH /api/orders/:id/return
// =========================================

router.patch(
  "/:id/return",
  authMiddleware,
  requestReturn
);

// =========================================
// DOWNLOAD ORDER INVOICE
// GET /api/orders/:id/invoice
// =========================================

router.get(
  "/:id/invoice",
  authMiddleware,
  downloadInvoice
);

export default router;