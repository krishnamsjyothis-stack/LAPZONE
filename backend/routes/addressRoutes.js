import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

const router = express.Router();


// GET ALL ADDRESSES
router.get(
  "/",
  authMiddleware,
  getAddresses
);


// ADD ADDRESS
router.post(
  "/",
  authMiddleware,
  addAddress
);


// UPDATE ADDRESS
router.put(
  "/:id",
  authMiddleware,
  updateAddress
);


// DELETE ADDRESS
router.delete(
  "/:id",
  authMiddleware,
  deleteAddress
);


export default router;
fds