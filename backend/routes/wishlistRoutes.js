import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

// Get wishlist
router.get("/", authMiddleware, getWishlist);

// Add product to wishlist
router.post("/", authMiddleware, addToWishlist);

// Remove product from wishlist
router.delete("/:productId", authMiddleware, removeFromWishlist);

export default router;