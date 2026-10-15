import express from "express";

import {
  getInventory,
  updateStock,
} from "../controllers/adminInventoryController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get inventory
router.get("/", adminMiddleware, getInventory);

// Update product stock
router.patch("/:id/stock", adminMiddleware, updateStock);

export default router;