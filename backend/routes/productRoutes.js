import express from "express";

import validateProduct from "../middleware/validateProduct.js";
import uploadProductImages from "../middleware/uploadProductImages.js";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import uploadProductImagesController from "../controllers/productImageController.js";

const router = express.Router();

// Product routes

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", validateProduct, createProduct);

router.put(
  "/:id",
  uploadProductImages.array("images", 10),
  updateProduct
);

router.delete("/:id", deleteProduct);

// Image upload

router.post(
  "/upload-images",
  uploadProductImages.array("images", 10),
  uploadProductImagesController
);

export default router;