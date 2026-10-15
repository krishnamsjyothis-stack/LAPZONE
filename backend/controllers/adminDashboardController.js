import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const getAdminDashboard = async (req, res) => {
  try {
    // =================================================
    // BASIC COUNTS
    // =================================================

    const totalOrders = await Order.countDocuments();

    const totalCustomers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 },
    });


    // =================================================
    // TOTAL SALES
    // =================================================

    const salesResult = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;


    // =================================================
    // RECENT ORDERS
    // =================================================

    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();


    // =================================================
    // TOP PRODUCTS
    // =================================================

    const topProducts = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "Cancelled" },
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.productId",

          productName: {
            $first: "$items.productName",
          },

          productImage: {
            $first: "$items.productImage",
          },

          quantitySold: {
            $sum: "$items.quantity",
          },
        },
      },

      {
        $sort: {
          quantitySold: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);


    // =================================================
    // SALES OVERVIEW
    // LAST 7 DAYS
    // =================================================

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 6
    );

    sevenDaysAgo.setHours(0, 0, 0, 0);


    const salesOverview = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
          },

          orderStatus: {
            $ne: "Cancelled",
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },

          sales: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);


    // =================================================
    // SEND RESPONSE
    // =================================================

    res.status(200).json({
      success: true,

      stats: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
      },

      recentOrders,

      topProducts,

      salesOverview,
    });

  } catch (error) {

    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};


export {
  getAdminDashboard,
};