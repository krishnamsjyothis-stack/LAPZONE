import Order from "../models/Order.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Product from "../models/Product.js";

// =====================================================
// GET ALL ORDERS
// =====================================================

const getAllOrders = async (req, res) => {
  try {
    const {
      search,
      status,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // -----------------------------
    // SEARCH
    // -----------------------------

    if (search) {
      const users = await User.find({
        $or: [
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
        ],
      }).select("_id");

      const userIds = users.map(
        (user) => user._id
      );

      query = {
        $or: [
          {
            orderId: {
              $regex: search,
              $options: "i",
            },
          },
          {
            userId: {
              $in: userIds,
            },
          },
        ],
      };
    }

    // -----------------------------
    // FILTER
    // -----------------------------

    if (status) {
      query.orderStatus = status;
    }

    // -----------------------------
    // SORT
    // -----------------------------

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    // -----------------------------
    // PAGINATION
    // -----------------------------

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip =
      (pageNumber - 1) * limitNumber;

    const totalOrders =
      await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate(
        "userId",
        "name email phone"
      )
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(
      totalOrders / limitNumber
    );

    return res.status(200).json({
      message:
        "Orders fetched successfully",
      orders,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalOrders,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error(
      "Get all admin orders error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// =====================================================
// GET SINGLE ADMIN ORDER
// =====================================================

const getAdminOrderById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(
      id
    ).populate(
      "userId",
      "name email phone"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message:
        "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Get admin order details error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch order details",
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // =========================================
    // PREVENT DUPLICATE CANCELLATION
    // =========================================

    if (
      order.orderStatus === "Cancelled" &&
      orderStatus === "Cancelled"
    ) {
      return res.status(400).json({
        message: "Order is already cancelled",
      });
    }

    // =========================================
    // CANCEL ORDER
    // =========================================

    if (
      orderStatus === "Cancelled" &&
      order.orderStatus !== "Cancelled"
    ) {
      // -----------------------------------------
      // RESTORE STOCK
      // -----------------------------------------

      for (const item of order.items) {
        // Skip items that were already cancelled
        if (item.cancelled) {
          continue;
        }

        const product = await Product.findById(
          item.productId
        );

        if (!product) {
          console.error(
            `Product not found while restoring stock: ${item.productId}`
          );

          continue;
        }

        product.stock += item.quantity;

        await product.save();
      }

      // -----------------------------------------
      // WALLET REFUND
      // -----------------------------------------

      if (
        order.paymentMethod === "WALLET"
      ) {
        let wallet = await Wallet.findOne({
          userId: order.userId,
        });

        if (!wallet) {
          wallet = await Wallet.create({
            userId: order.userId,
            balance: 0,
            transactions: [],
          });
        }

        wallet.balance += order.totalAmount;

        wallet.transactions.push({
          type: "CREDIT",
          amount: order.totalAmount,
          reason: "Refund for cancelled order",
          orderId: order._id,
        });

        await wallet.save();
      }

      // -----------------------------------------
      // SAVE CANCELLATION
      // -----------------------------------------

      order.orderStatus = "Cancelled";

      await order.save();

      return res.status(200).json({
        message:
          "Order cancelled, stock restored and refund processed",
        order,
      });
    }

    // =========================================
    // NORMAL STATUS UPDATE
    // =========================================

    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update order status",
    });
  }
};
// =====================================================
// GET RETURN REQUESTS
// =====================================================

const getReturnRequests = async (
  req,
  res
) => {
  try {
    const orders = await Order.find({
      returnStatus: "Requested",
    })
      .populate(
        "userId",
        "name email phone"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message:
        "Return requests fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(
      "Get return requests error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch return requests",
    });
  }
};

// =====================================================
// UPDATE RETURN STATUS
// =====================================================

const updateReturnStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { returnStatus } = req.body;

    const allowedStatuses = [
      "Approved",
      "Rejected",
    ];

    // -----------------------------
    // VALIDATE STATUS
    // -----------------------------

    if (
      !allowedStatuses.includes(
        returnStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid return status",
      });
    }

    // -----------------------------
    // FIND ORDER
    // -----------------------------

    const order = await Order.findById(
      id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // -----------------------------
    // RETURN MUST BE PENDING
    // -----------------------------

    if (
      order.returnStatus !==
      "Requested"
    ) {
      return res.status(400).json({
        message:
          "This return request is not pending",
      });
    }

    // =================================================
    // REJECT RETURN
    // =================================================

    if (returnStatus === "Rejected") {
      order.returnStatus = "Rejected";

      await order.save();

      return res.status(200).json({
        message:
          "Return request rejected successfully",
        order,
      });
    }

    // =================================================
    // APPROVE RETURN
    // =================================================

    // -----------------------------
    // RESTORE PRODUCT STOCK
    // -----------------------------

    for (const item of order.items) {
      const product =
        await Product.findById(
          item.productId
        );

      if (!product) {
        console.error(
          `Product not found while restoring stock: ${item.productId}`
        );

        continue;
      }

      product.stock += item.quantity;

      await product.save();
    }

    // -----------------------------
    // FIND USER WALLET
    // -----------------------------

    let wallet =
      await Wallet.findOne({
        userId: order.userId,
      });

    // -----------------------------
    // CREATE WALLET IF NEEDED
    // -----------------------------

    if (!wallet) {
      wallet = await Wallet.create({
        userId: order.userId,
        balance: 0,
        transactions: [],
      });
    }

    // -----------------------------
    // REFUND TO WALLET
    // -----------------------------

    wallet.balance +=
      order.totalAmount;

    // -----------------------------
    // RECORD TRANSACTION
    // -----------------------------

    wallet.transactions.push({
      type: "CREDIT",
      amount: order.totalAmount,
      reason:
        "Refund for returned order",
      orderId: order._id,
    });

    await wallet.save();

    // -----------------------------
    // UPDATE ORDER
    // -----------------------------

    order.returnStatus = "Approved";

    await order.save();

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(200).json({
      message:
        "Return approved, stock restored and refund added to wallet",
      order,
      walletBalance: wallet.balance,
    });
  } catch (error) {
    console.error(
      "Update return status error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update return status",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

export {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  getReturnRequests,
  updateReturnStatus,
};