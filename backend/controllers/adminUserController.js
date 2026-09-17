import User from "../models/User.js";


// ================= GET USERS =================

export const getUsers = async (req, res) => {
  try {

    const search = req.query.search?.trim() || "";

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;


    // ================= SEARCH FILTER =================

    const filter = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }


    // ================= TOTAL USERS =================

    const totalUsers = await User.countDocuments(filter);


    // ================= FETCH USERS =================

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


    const totalPages = Math.ceil(
      totalUsers / limit
    );


    return res.status(200).json({

      message: "Users fetched successfully",

      users,

      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
      },

    });

  } catch (error) {

    console.error(
      "Get users error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};


// ================= BLOCK USER =================

export const blockUser = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await User.findById(id);


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    user.isBlocked = true;

    await user.save();


    return res.status(200).json({
      message: "User blocked successfully",
    });

  } catch (error) {

    console.error(
      "Block user error:",
      error
    );

    return res.status(500).json({
      message: "Failed to block user",
    });
  }
};


// ================= UNBLOCK USER =================

export const unblockUser = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await User.findById(id);


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    user.isBlocked = false;

    await user.save();


    return res.status(200).json({
      message: "User unblocked successfully",
    });

  } catch (error) {

    console.error(
      "Unblock user error:",
      error
    );

    return res.status(500).json({
      message: "Failed to unblock user",
    });
  }
};