import User from "../models/User.js";

// ================= GET PROFILE =================

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
// ================= UPDATE PROFILE =================

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
export {
  getProfile,
  updateProfile,
};