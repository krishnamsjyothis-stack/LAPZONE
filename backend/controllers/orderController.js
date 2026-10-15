import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import PDFDocument from "pdfkit";
import Wallet from "../models/Wallet.js";
import Coupon from "../models/Coupon.js";
import Referral from "../models/Referral.js";
import { getBestOffer } from "../utils/offerUtils.js";

// ======================================================
// CREATE ORDER
// ======================================================
const createOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      addressId,
      paymentMethod = "COD",
      couponCode,
    } = req.body;

    // --------------------------------------------------
    // Validate payment method
    // --------------------------------------------------
    const allowedPaymentMethods = ["COD", "WALLET"];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // --------------------------------------------------
    // Validate address
    // --------------------------------------------------
    if (!addressId) {
      return res.status(400).json({
        message: "Address is required",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    // --------------------------------------------------
    // Find user's cart
    // --------------------------------------------------
    const cart = await Cart.findOne({
      userId,
    }).populate("items.productId");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // --------------------------------------------------
    // Check products and stock
    // --------------------------------------------------
    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          message: "One of the products no longer exists",
        });
      }

      if (product.isActive === false) {
        return res.status(400).json({
          message: `${product.name} is currently unavailable`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

    // --------------------------------------------------
    // Create order items
    // --------------------------------------------------
    const orderItems = [];

    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.productId;

      // Get best active offer
      const offer = await getBestOffer(product);

      // Use offer price if an offer exists
      const price = offer.hasOffer
        ? offer.finalPrice
        : product.price;

      const quantity = item.quantity;

      const itemTotal = price * quantity;

      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage:
          product.images?.[0] ||
          product.image ||
          "",
        price,
        quantity,
        itemTotal,
        cancelled: false,
        cancellationReason: "",
      });
    }

    // --------------------------------------------------
    // COUPON / DISCOUNT
    // --------------------------------------------------
    let discount = 0;
    let appliedCouponCode = "";

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
      });

      if (!coupon) {
        return res.status(400).json({
          message: "Invalid coupon code",
        });
      }

      if (!coupon.isActive) {
        return res.status(400).json({
          message: "This coupon is inactive",
        });
      }

      const now = new Date();

      if (now < coupon.startDate) {
        return res.status(400).json({
          message: "This coupon is not active yet",
        });
      }

      if (now > coupon.expiryDate) {
        return res.status(400).json({
          message: "This coupon has expired",
        });
      }

      if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          message: "This coupon usage limit has been reached",
        });
      }

      // Minimum order amount
      if (subtotal < coupon.minimumOrderAmount) {
        return res.status(400).json({
          message:
            `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
        });
      }

      // Percentage discount
      if (coupon.discountType === "PERCENTAGE") {
        discount =
          (subtotal * coupon.discountValue) / 100;

        if (
          coupon.maximumDiscount !== null &&
          discount > coupon.maximumDiscount
        ) {
          discount = coupon.maximumDiscount;
        }
      }

      // Fixed discount
      if (coupon.discountType === "FIXED") {
        discount = coupon.discountValue;
      }

      // Discount cannot exceed subtotal
      if (discount > subtotal) {
        discount = subtotal;
      }

      discount = Math.round(discount);

      appliedCouponCode = coupon.code;
    }

    // --------------------------------------------------
    // REFERRAL DISCOUNT
    // --------------------------------------------------
    // --------------------------------------------------
// REFERRAL DISCOUNT
// --------------------------------------------------
let referralDiscount = 0;
let appliedReferralCode = "";

const referral = await Referral.findOne({
  referredUser: userId,
  isActive: true,
  discountUsed: false,
  expiryDate: {
    $gte: new Date(),
  },
});

if (referral) {
  // Amount remaining after coupon
  const remainingAmount = Math.max(
    subtotal - discount,
    0
  );

  // Percentage referral discount
  if (referral.discountType === "PERCENTAGE") {
    referralDiscount =
      (remainingAmount * referral.discountValue) / 100;

    // Apply maximum discount limit
    if (
      referral.maximumDiscount !== null &&
      referralDiscount > referral.maximumDiscount
    ) {
      referralDiscount =
        referral.maximumDiscount;
    }
  }

  // Fixed referral discount
  if (referral.discountType === "FIXED") {
    referralDiscount =
      referral.discountValue;
  }

  // Referral discount cannot exceed
  // the remaining amount after coupon
  if (referralDiscount > remainingAmount) {
    referralDiscount = remainingAmount;
  }

  referralDiscount = Math.round(
    referralDiscount
  );

  appliedReferralCode =
    referral.referralCode;
}

    // --------------------------------------------------
    // DELIVERY CHARGE
    // --------------------------------------------------
    const deliveryCharge = 0;

    // --------------------------------------------------
    // FINAL AMOUNT
    // --------------------------------------------------
    let totalAmount =
      subtotal -
      discount -
      referralDiscount +
      deliveryCharge;

    // Prevent negative total
    if (totalAmount < 0) {
      totalAmount = 0;
    }

    // Round final amount
    totalAmount = Math.round(totalAmount);

    // --------------------------------------------------
    // WALLET PAYMENT CHECK
    // --------------------------------------------------
    let wallet = null;

    if (paymentMethod === "WALLET") {
      wallet = await Wallet.findOne({
        userId,
      });

      if (!wallet) {
        return res.status(400).json({
          message: "Wallet not found",
        });
      }

      if (wallet.balance < totalAmount) {
        return res.status(400).json({
          message:
            `Insufficient wallet balance. ` +
            `Available balance: ₹${wallet.balance}`,
        });
      }
    }

    // --------------------------------------------------
    // GENERATE ORDER ID
    // --------------------------------------------------
    const orderId = `LAP-${Date.now()}`;

    // --------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------
    const order = await Order.create({
      orderId,

      userId,

      items: orderItems,

      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },

      subtotal,

      discount,

      couponCode: appliedCouponCode,

      referralCode: appliedReferralCode,

      referralDiscount,

      deliveryCharge,

      totalAmount,

      paymentMethod,

      paymentStatus:
        paymentMethod === "WALLET"
          ? "Paid"
          : "Pending",

      orderStatus: "Pending",

      cancellationReason: "",

      returnReason: "",

      returnStatus: "Not Requested",
    });

    // --------------------------------------------------
    // MARK REFERRAL DISCOUNT AS USED
    // --------------------------------------------------
    if (appliedReferralCode) {
      await Referral.findOneAndUpdate(
        {
          referralCode: appliedReferralCode,
          referredUser: userId,
        },
        {
          $set: {
            discountUsed: true,
          },
        }
      );
    }

    // --------------------------------------------------
    // INCREASE COUPON USAGE
    // --------------------------------------------------
    if (appliedCouponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: appliedCouponCode,
        },
        {
          $inc: {
            usedCount: 1,
          },
        }
      );
    }

    // --------------------------------------------------
    // REDUCE PRODUCT STOCK
    // --------------------------------------------------
    for (const item of cart.items) {
      const product = item.productId;

      await Product.findByIdAndUpdate(
        product._id,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    // --------------------------------------------------
    // WALLET PAYMENT
    // Deduct amount from wallet
    // --------------------------------------------------
    if (paymentMethod === "WALLET") {
      wallet.balance -= totalAmount;

      wallet.transactions.push({
        type: "DEBIT",
        amount: totalAmount,
        reason: "Order payment",
        orderId: order._id,
      });

      await wallet.save();
    }

    // --------------------------------------------------
    // CLEAR CART
    // --------------------------------------------------
    cart.items = [];

    await cart.save();

    // --------------------------------------------------
    // SUCCESS RESPONSE
    // --------------------------------------------------
    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY ORDERS
// ======================================================
const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// ======================================================
// GET SINGLE ORDER
// ======================================================
const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

// ======================================================
// CANCEL ENTIRE ORDER
// ======================================================
const cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const order = await Order.findOne({
      _id: id,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only Pending orders can be cancelled
    if (order.orderStatus !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    // --------------------------------------------------
    // RESTORE STOCK
    // --------------------------------------------------
    for (const item of order.items) {
      if (!item.cancelled) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              stock: item.quantity,
            },
          }
        );

        item.cancelled = true;

        item.cancellationReason =
          cancellationReason ||
          "Order cancelled";
      }
    }

    // --------------------------------------------------
    // WALLET REFUND
    // --------------------------------------------------
    if (
      order.paymentMethod === "WALLET" &&
      order.paymentStatus === "Paid"
    ) {
      let wallet = await Wallet.findOne({
        userId,
      });

      if (!wallet) {
        wallet = await Wallet.create({
          userId,
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

    // --------------------------------------------------
    // UPDATE ORDER
    // --------------------------------------------------
    order.orderStatus = "Cancelled";

    order.cancellationReason =
      cancellationReason ||
      "Order cancelled";

    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Cancel order error:",
      error
    );

    return res.status(500).json({
      message: "Failed to cancel order",
    });
  }
};

// ======================================================
// CANCEL SINGLE ORDER ITEM
// ======================================================
const cancelOrderItem = async (req, res) => {
  try {
    const userId = req.userId;

    const { id, itemId } = req.params;

    const { cancellationReason } = req.body;

    const order = await Order.findOne({
      _id: id,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Order item not found",
      });
    }

    if (item.cancelled) {
      return res.status(400).json({
        message: "Item is already cancelled",
      });
    }

    // --------------------------------------------------
    // RESTORE STOCK
    // --------------------------------------------------
    await Product.findByIdAndUpdate(
      item.productId,
      {
        $inc: {
          stock: item.quantity,
        },
      }
    );

    item.cancelled = true;

    item.cancellationReason =
      cancellationReason ||
      "Item cancelled";

    // --------------------------------------------------
    // CHECK IF ALL ITEMS ARE CANCELLED
    // --------------------------------------------------
    const allCancelled = order.items.every(
      (orderItem) => orderItem.cancelled
    );

    if (allCancelled) {
      order.orderStatus = "Cancelled";

      order.cancellationReason =
        cancellationReason ||
        "All items cancelled";

      // Wallet refund for fully cancelled wallet order
      if (
        order.paymentMethod === "WALLET" &&
        order.paymentStatus === "Paid"
      ) {
        let wallet = await Wallet.findOne({
          userId,
        });

        if (!wallet) {
          wallet = await Wallet.create({
            userId,
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
    }

    await order.save();

    return res.status(200).json({
      message:
        "Order item cancelled successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Cancel order item error:",
      error
    );

    return res.status(500).json({
      message: "Failed to cancel order item",
    });
  }
};

// ======================================================
// REQUEST RETURN
// ======================================================
const requestReturn = async (req, res) => {
  try {
    const userId = req.userId;

    const { id } = req.params;

    const { returnReason } = req.body;

    if (
      !returnReason ||
      !returnReason.trim()
    ) {
      return res.status(400).json({
        message: "Return reason is required",
      });
    }

    const order = await Order.findOne({
      _id: id,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only delivered orders can be returned
    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        message:
          "Only delivered orders can be returned",
      });
    }

    if (
      order.returnStatus !==
      "Not Requested"
    ) {
      return res.status(400).json({
        message:
          "Return request already exists",
      });
    }

    order.returnReason =
      returnReason.trim();

    order.returnStatus = "Requested";

    await order.save();

    return res.status(200).json({
      message:
        "Return request submitted successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Request return error:",
      error
    );

    return res.status(500).json({
      message: "Failed to request return",
    });
  }
};

// ======================================================
// DOWNLOAD INVOICE
// ======================================================
const downloadInvoice = async (req, res) => {
  try {
    const userId = req.userId;

    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );

    const doc = new PDFDocument();

    doc.pipe(res);

    doc.fontSize(20).text(
      "LAPZONE INVOICE",
      {
        align: "center",
      }
    );

    doc.moveDown();

    doc.fontSize(12).text(
      `Order ID: ${order.orderId}`
    );

    doc.text(
      `Order Date: ${new Date(
        order.createdAt
      ).toLocaleDateString()}`
    );

    doc.text(
      `Payment Method: ${order.paymentMethod}`
    );

    doc.text(
      `Payment Status: ${order.paymentStatus}`
    );

    doc.moveDown();

    doc.text("Shipping Address:");

    doc.text(
      order.shippingAddress.fullName
    );

    doc.text(
      order.shippingAddress.phone
    );

    doc.text(
      order.shippingAddress.addressLine
    );

    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
    );

    doc.moveDown();

    doc.text("Products:");

    order.items.forEach((item) => {
      doc.moveDown(0.5);

      doc.text(
        `${item.productName} x ${item.quantity}`
      );

      doc.text(
        `Price: ₹${item.price}`
      );

      doc.text(
        `Total: ₹${item.itemTotal}`
      );
    });

    doc.moveDown();

    doc.text(
      `Subtotal: ₹${order.subtotal}`
    );

    doc.text(
      `Coupon Discount: ₹${order.discount}`
    );

    doc.text(
      `Referral Discount: ₹${order.referralDiscount}`
    );

    doc.text(
      `Delivery: ₹${order.deliveryCharge}`
    );

    doc.fontSize(14).text(
      `Total Amount: ₹${order.totalAmount}`
    );

    doc.moveDown();

    doc.text(
      "Thank you for shopping with LAPZONE!"
    );

    doc.end();
  } catch (error) {
    console.error(
      "Download invoice error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to generate invoice",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================
export {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  cancelOrderItem,
  requestReturn,
  downloadInvoice,
};