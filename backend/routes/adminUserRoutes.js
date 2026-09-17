import express from "express";

import {
  getUsers,
  blockUser,
  unblockUser,
} from "../controllers/adminUserController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();



router.get(
  "/users",
  adminMiddleware,
  getUsers
);




router.patch(
  "/users/:id/block",
  adminMiddleware,
  blockUser
);




router.patch(
  "/users/:id/unblock",
  adminMiddleware,
  unblockUser
);


export default router;