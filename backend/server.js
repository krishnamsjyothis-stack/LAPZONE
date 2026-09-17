import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";

import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();

const app = express();

// ================= CORS =================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ================= MIDDLEWARE =================

app.use(express.json());

app.use("/uploads", express.static("uploads"));

// ================= SESSION =================

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ================= DATABASE =================

connectDB();

// ================= ROUTES =================

// User authentication
app.use("/api/auth", authRoutes);

// User profile
app.use("/api/user", userRoutes);

// OTP
app.use("/api/otp", otpRoutes);

// Admin authentication
app.use("/api/admin", adminAuthRoutes);

// Admin user management
app.use("/api/admin", adminUserRoutes);

// Address
app.use("/api/address", addressRoutes);

// Products
app.use("/api/products", productRoutes);

// Cart
app.use("/api/cart", cartRoutes);

// Categories
app.use("/api/categories", categoryRoutes);

// ================= TEST ROUTES =================

app.get("/api/users", (req, res) => {
  res.json({
    message: "Users fetched successfully",
  });
});

app.get("/test-category", (req, res) => {
  res.send("Category route test is working");
});

// ================= HOME =================

app.get("/", (req, res) => {
  res.send("LAPZONE Backend is running!");
});

// ================= START SERVER =================
    
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});