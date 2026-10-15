import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import validateCart from "../middleware/validateCart.js";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);

router.post("/", authMiddleware, validateCart, addToCart);

router.put(
  "/:productId",
  authMiddleware,
  updateCartItem
);

router.delete("/:productId", authMiddleware, removeFromCart);

router.delete("/", authMiddleware, clearCart);

export default router;