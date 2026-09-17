import User from "../models/User.js";
import Otp from "../models/Otp.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";

  const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        message: "Profile fetched successfully",
        user,
      });

    } catch (error) {
      console.error("Get profile error:", error);

      return res.status(500).json({
        message: "Failed to fetch profile",
      });
    }
  };
  const updateProfile = async (req, res) => {
    try {
      console.log("========== UPDATE PROFILE ==========");
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);
      console.log("USER ID:", req.userId);

      const { name, phone } = req.body;

      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Update name
      if (name) {
        user.name = name.trim();
      }

      // Update phone
      user.phone = phone || "";

      // Update profile image
      if (req.file) {
        console.log("Uploaded file:", req.file);

        user.profileImage = `/uploads/profile/${req.file.filename}`;

        console.log(
          "Profile image path:",
          user.profileImage
        );
      } else {
        console.log("NO IMAGE RECEIVED");
      }

      await user.save();

      console.log("SAVED USER:", user);

      return res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
        },
      });

    } catch (error) {
      console.error("Update profile error:", error);

      return res.status(500).json({
        message: "Failed to update profile",
      });
    }
  };
  // ================= CHANGE PASSWORD =================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Prevent using the same password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Failed to change password",
    });
  }
};
  // ================= CHANGE EMAIL - SEND OTP =================

const sendChangeEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "New email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if new email is same as current email
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (currentUser.email === cleanEmail) {
      return res.status(400).json({
        message: "New email must be different from current email",
      });
    }

    // Check if email is already used
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "This email is already registered",
      });
    }

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Delete old change-email OTP
    await Otp.deleteMany({
      email: cleanEmail,
      purpose: "change-email",
    });

    // Save OTP
    await Otp.create({
      email: cleanEmail,
      otp,
      purpose: "change-email",
      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      ),
    });

    // Send OTP
    await sendEmail(
      cleanEmail,
      "LAPZONE Change Email OTP",
      `Your LAPZONE email change OTP is: ${otp}. It will expire in 5 minutes.`
    );

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(
      "Send change email OTP error:",
      error
    );

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};
const verifyChangeEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findById(req.userId);

    if (user.authProvider === "google") {
  return res.status(400).json({
    message: "Email cannot be changed for Google accounts",
  });
}

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "This email is already registered",
      });
    }

    const otpRecord = await Otp.findOne({
      email: cleanEmail,
      otp: otp.toString(),
      purpose: "change-email",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    user.email = cleanEmail;

    await user.save();

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(200).json({
      message: "Email changed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Verify change email OTP error:", error);

    return res.status(500).json({
      message: "Failed to change email",
    });
  }
};

export {
  getProfile,
  updateProfile,
  sendChangeEmailOtp,
  verifyChangeEmailOtp,
  changePassword,
};