import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

// GET ALL CUSTOMER WALLETS

export const getAllWallets = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));

    let userQuery = {};

    if (search.trim()) {
      userQuery = {
        $or: [
          { name: { $regex: search.trim(), $options: "i" } },
          { email: { $regex: search.trim(), $options: "i" } },
        ],
      };
    }

    const users = await User.find(userQuery)
      .select("_id name email phone")
      .lean();

    const userIds = users.map((user) => user._id);

    const walletQuery = search.trim()
      ? { userId: { $in: userIds } }
      : {};

    const sortOption =
      sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const totalWallets = await Wallet.countDocuments(walletQuery);

    const wallets = await Wallet.find(walletQuery)
      .populate("userId", "name email phone")
      .sort(sortOption)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const summaryResult = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWallets: { $sum: 1 },
          totalBalance: { $sum: "$balance" },
          totalTransactions: {
            $sum: {
              $size: { $ifNull: ["$transactions", []] },
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Wallets fetched successfully",
      wallets,
      summary: summaryResult[0] || {
        totalWallets: 0,
        totalBalance: 0,
        totalTransactions: 0,
      },
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalWallets / limitNumber),
        totalWallets,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Get admin wallets error:", error);
    return res.status(500).json({
      message: "Failed to fetch wallets",
    });
  }
};


export const getMyWallet = async (req, res) => {
  try {
    const userId = req.userId;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        transactions: [],
      });
    }

    return res.status(200).json({
      message: "Wallet fetched successfully",
      wallet,
    });
  } catch (error) {
    console.error("Get wallet error:", error);

    return res.status(500).json({
      message: "Failed to fetch wallet",
    });
  }
};


// GET ONE CUSTOMER'S WALLET AND TRANSACTIONS
export const getAdminWalletById = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("transactions.orderId", "orderId totalAmount")
      .lean();

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found",
      });
    }

    return res.status(200).json({
      message: "Wallet fetched successfully",
      wallet,
    });
  } catch (error) {
    console.error("Get admin wallet details error:", error);

    return res.status(500).json({
      message: "Failed to fetch wallet details",
    });
  }
};
