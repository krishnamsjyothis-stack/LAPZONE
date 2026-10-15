
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is missing");
      return res.status(500).json({
        message: "Google login is not configured",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({
        message: "Authentication is not configured",
      });
    }

    // Verify the Google credential
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({
        message: "Please use a verified Google account",
      });
    }

    const email = payload.email.trim().toLowerCase();
    const name = payload.name || "Google User";
    const googleId = payload.sub;

    // Find the account by email
    let user = await User.findOne({ email });

    // Create a user only when the email is not registered
    if (!user) {
      user = await User.create({
        name,
        email,
        password: googleId,
      });
    }

    // Do not allow blocked accounts to log in
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    // Generate LAPZONE JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
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
    console.error("Google login error:", error.message);

    return res.status(500).json({
      message: "Google login failed",
    });
  }
};

export default googleLogin;
