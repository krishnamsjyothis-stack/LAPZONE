  import dotenv from "dotenv";
  import express from "express";
  import cors from "cors";

  import connectDB from "./config/db.js";
  import authRoutes from "./routes/authRoutes.js";
  import userRoutes from "./routes/userRoutes.js";
  import otpRoutes from "./routes/otpRoutes.js";
  import addressRoutes from "./routes/addressRoutes.js";

  dotenv.config();

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));

  // Connect MongoDB
  connectDB();

  // Auth routes
  app.use("/api/auth", authRoutes);

  // User routes
  app.use("/api/user", userRoutes);

  // OTP routes
  app.use("/api/otp", otpRoutes);

  app.use("/api/address", addressRoutes);

  // Test users API
  app.get("/api/users", (req, res) => {
    res.json({
      message: "Users fetched successfully",
    });
  });

  // Home route
  app.get("/", (req, res) => {
    res.send("LAPZONE Backend is running!");
  });

  // Start server
  app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
  });