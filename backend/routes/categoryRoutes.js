import express from "express";

import validateCategory from "../middleware/validateCategory.js";

import {
  addCategory,
  updateCategory,
  getCategories,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);

router.post("/", validateCategory, addCategory);

router.put("/:id", validateCategory, updateCategory);

router.delete("/:id", deleteCategory);

export default router;