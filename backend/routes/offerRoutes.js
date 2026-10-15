import express from "express";

import {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
} from "../controllers/offerController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get all offers
router.get("/", adminMiddleware, getOffers);

// Get single offer
router.get("/:id", adminMiddleware, getOfferById);

// Create offer
router.post("/", adminMiddleware, createOffer);

// Update offer
router.patch("/:id", adminMiddleware, updateOffer);

// Delete offer
router.delete("/:id", adminMiddleware, deleteOffer);

export default router;