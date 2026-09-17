import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import addressSchema from "../middleware/validateAddress.js";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

const router = express.Router();

router.get("/", authMiddleware, getAddresses);

router.post("/", authMiddleware, (req, res, next) => {
  const result = addressSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Address validation failed",
      errors: result.error.issues,
    });
  }

  next();
}, addAddress);

router.put("/:id", authMiddleware, updateAddress);

router.delete("/:id", authMiddleware, deleteAddress);

export default router;