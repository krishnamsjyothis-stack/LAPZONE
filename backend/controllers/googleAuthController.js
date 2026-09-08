import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    // Verify Google credential
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      email,
      name,
      sub: googleId,
    } = payload;

    if (!email) {
      return res.status(400).json({
        message: "Google account email not found",
      });
    }

    // Find existing user
    let user = await User.findOne({ email });

    // Create user if not found
    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email,
        password: googleId,
      });
    }

    // Check blocked account
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    // Create LAPZONE JWT
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
    console.error(
      "Google login error:",
      error
    );

    return res.status(500).json({
      message: "Google login failed",
    });
  }
};

export default googleLogin;