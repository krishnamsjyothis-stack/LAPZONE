import "dotenv/config";
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
import adminOrderRoutes from "./routes/adminOrderRoutes.js";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminInventoryRoutes from "./routes/adminInventoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminWalletRoutes from "./routes/adminWalletRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminReviewRoutes from "./routes/adminReviewRoutes.js";


const app = express();
// ================= CORS =================

const allowedOrigins = [
  "http://localhost:5173",
  "https://week2.d1ie3v9l8qfu86.amplifyapp.com",
];

app.use(
  cors({
    origin: allowedOrigins,
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

// ================= USER ROUTES =================

// User authentication
app.use("/api/auth", authRoutes);

// User profile
app.use("/api/user", userRoutes);

// OTP
app.use("/api/otp", otpRoutes);

// Address
app.use("/api/address", addressRoutes);

// Products
app.use("/api/products", productRoutes);

// Cart
app.use("/api/cart", cartRoutes);

// Categories
app.use("/api/categories", categoryRoutes);

// Wishlist
app.use("/api/wishlist", wishlistRoutes);

// User orders
app.use("/api/orders", orderRoutes);

app.use("/api/reports", reportRoutes);

// Payment
app.use("/api/payment", paymentRoutes);

app.use("/api/wallet", walletRoutes);

app.use("/api/coupon", couponRoutes);

app.use("/api/referrals", referralRoutes);



// ================= ADMIN ROUTES =================

// Admin authentication
app.use("/api/admin", adminAuthRoutes);

// Admin user management
app.use("/api/admin", adminUserRoutes);

// Admin order management
app.use("/api/admin/orders", adminOrderRoutes);

app.use("/api/admin/inventory", adminInventoryRoutes);

app.use("/api/offers", offerRoutes);

app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use("/api/admin/wallets", adminWalletRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/admin/reviews", adminReviewRoutes);
// ================= TEST ROUTES =================

app.get("/api/users", (req, res) => {
  res.json({
    message: "Users fetched successfully",
  });
});

app.get("/test-category", (req, res) => {
  res.send("Category route test is working");
});

app.get("/test-wishlist", (req, res) => {
  res.json({
    message: "Wishlist route is connected successfully",
  });
});

// ================= HOME =================

app.get("/", (req, res) => {
  res.send("LAPZONE Backend is running!");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`LAPZONE backend running on port ${PORT}`);
});