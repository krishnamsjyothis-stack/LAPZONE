import express from "express";
import {
  getAllWallets,
  getAdminWalletById,
} from "../controllers/walletController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", adminMiddleware, getAllWallets);
router.get("/:id", adminMiddleware, getAdminWalletById);

export default router;