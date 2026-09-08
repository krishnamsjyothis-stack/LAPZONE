import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import sendEmail from "../utils/sendEmail.js";




// ================= SIGNUP =================

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Delete old signup OTP
    await Otp.deleteMany({
      email: cleanEmail,
      purpose: "signup",
    });

    // Save signup OTP
    await Otp.create({
      email: cleanEmail,
      otp,
      name,
      password: hashedPassword,
      purpose: "signup",
      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      ),
    });

    // Send OTP
    await sendEmail(
      cleanEmail,
      "LAPZONE Signup OTP",
      `Your LAPZONE signup OTP is: ${otp}`
    );

    console.log("SIGNUP OTP SENT TO:", cleanEmail);

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Signup OTP error:", error);

    return res.status(500).json({
      message: "Failed to send signup OTP",
    });
  }
};
// ================= VERIFY SIGNUP OTP =================

const verifySignupOtp = async (req, res) => {
  try {
    console.log("========== VERIFY SIGNUP OTP ==========");
    console.log("BODY:", req.body);

    const { email, otp } = req.body;

    // Check fields
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    console.log("EMAIL:", cleanEmail);
    console.log("OTP:", otp);

    // Find signup OTP
    const otpRecord = await Otp.findOne({
      email: cleanEmail,
      otp: otp.toString(),
      purpose: "signup",
    });

    console.log("OTP RECORD:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    console.log("EXISTING USER:", existingUser);

    if (existingUser) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password,
    });

    console.log("USER CREATED:", user);

    // Delete OTP after successful signup
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("========== VERIFY SIGNUP OTP ERROR ==========");
    console.error(error);
    console.error("MESSAGE:", error.message);

    return res.status(500).json({
      message: "Failed to verify signup OTP",
      error: error.message,
    });
  }
};
// ================= LOGIN =================

// ================= LOGIN =================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Google users don't have a normal password
    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

// ================= FORGOT PASSWORD =================

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Delete old forgot-password OTPs only
    await Otp.deleteMany({
      email: cleanEmail,
      purpose: "forgot-password",
    });

    await Otp.create({
      email: cleanEmail,
      otp,
      purpose: "forgot-password",
      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      ),
    });

    await sendEmail(
      cleanEmail,
      "LAPZONE Password Reset OTP",
      `Your LAPZONE password reset OTP is: ${otp}`
    );

    console.log(
      "PASSWORD RESET OTP SENT TO:",
      cleanEmail
    );

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};


// ================= VERIFY FORGOT PASSWORD OTP =================

// ================= VERIFY FORGOT PASSWORD OTP =================

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const otpRecord = await Otp.findOne({
      email: cleanEmail,
      otp,
      purpose: "forgot-password",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Delete verified OTP
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error(
      "Verify forgot password OTP error:",
      error
    );

    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;

    // Save user
    await user.save();

    console.log("Password updated successfully for:", user.email);

    // Send success response
    return res.status(200).json({
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};

// ================= GOOGLE LOGIN =================

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID
    );

    // Verify Google credential
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
    } = payload;

    if (!email) {
      return res.status(400).json({
        message: "Google account email not found",
      });
    }

    // Find existing user
    let user = await User.findOne({ email });

    // Create new user if not found
    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email,
        googleId,
        authProvider: "google",
      });

      console.log("GOOGLE USER CREATED:", email);
    } else {
      // Existing user
      user.googleId = googleId;

      if (user.authProvider !== "google") {
        user.authProvider = "google";
      }

      await user.save();

      console.log("GOOGLE USER FOUND:", email);
    }

    // Check blocked account
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      message: "Google login failed",
    });
  }
};

export {
  signup,
  verifySignupOtp,
  login,
  googleLogin,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
};;