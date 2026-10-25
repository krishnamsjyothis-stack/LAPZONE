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
 // DOWNLOAD INVOICE - STYLED PDF
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

    const address = order.shippingAddress || {};

    // PDF response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 45,
        bottom: 45,
        left: 45,
        right: 45,
      },
      bufferPages: true,
    });

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const left = 45;
    const right = pageWidth - 45;
    const contentWidth = right - left;

    const colors = {
      dark: "#202936",
      red: "#B51A2B",
      text: "#303846",
      muted: "#687386",
      light: "#F3F5F8",
      border: "#DCE1E8",
      white: "#FFFFFF",
      green: "#168653",
    };

    const money = (amount) =>
      `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const date = new Date(
      order.createdAt || Date.now()
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Draw a section heading
    const sectionHeading = (title, y) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(colors.dark)
        .text(title, left, y);

      doc
        .moveTo(left, y + 18)
        .lineTo(right, y + 18)
        .lineWidth(0.7)
        .strokeColor(colors.border)
        .stroke();

      return y + 28;
    };

    // Header background
    doc
      .rect(0, 0, pageWidth, 125)
      .fill(colors.dark);

    // Brand
    doc
      .font("Helvetica-Bold")
      .fontSize(25)
      .fillColor(colors.white)
      .text("LAPZONE", left, 35);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#D8DEE8")
      .text("YOUR LAPTOP STORE", left, 67);

    // Invoice label
    doc
      .font("Helvetica-Bold")
      .fontSize(19)
      .fillColor(colors.white)
      .text("INVOICE", left, 36, {
        width: contentWidth,
        align: "right",
      });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#D8DEE8")
      .text(
        `Invoice No: ${order.orderId || order._id}`,
        left,
        67,
        {
          width: contentWidth,
          align: "right",
        }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#D8DEE8")
      .text(`Invoice Date: ${date}`, left, 85, {
        width: contentWidth,
        align: "right",
      });

    // Start content below the header
    let y = 150;

    // Order information
    y = sectionHeading("ORDER INFORMATION", y);

    const infoTop = y;
    const columnGap = 25;
    const columnWidth = (contentWidth - columnGap) / 2;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(colors.muted)
      .text("Order ID", left, infoTop);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(colors.text)
      .text(
        String(order.orderId || order._id),
        left,
        infoTop + 14,
        { width: columnWidth }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(colors.muted)
      .text("Order Date", left + columnWidth + columnGap, infoTop);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(colors.text)
      .text(
        date,
        left + columnWidth + columnGap,
        infoTop + 14
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(colors.muted)
      .text("Payment Method", left, infoTop + 40);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(colors.text)
      .text(
        String(order.paymentMethod || "N/A"),
        left,
        infoTop + 54
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(colors.muted)
      .text(
        "Payment Status",
        left + columnWidth + columnGap,
        infoTop + 40
      );

    const paymentStatus = String(
      order.paymentStatus || "Pending"
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(
        paymentStatus.toLowerCase() === "paid"
          ? colors.green
          : colors.red
      )
      .text(
        paymentStatus,
        left + columnWidth + columnGap,
        infoTop + 54
      );

    y = infoTop + 85;

    // Shipping address
    y = sectionHeading("BILLING / SHIPPING ADDRESS", y);

    const addressLines = [
      address.fullName,
      address.phone ? `Phone: ${address.phone}` : "",
      address.addressLine,
      [address.city, address.state]
        .filter(Boolean)
        .join(", "),
      address.pincode
        ? `PIN: ${address.pincode}`
        : "",
    ].filter(Boolean);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(colors.text)
      .text(addressLines[0] || "Customer", left, y);

    let addressY = y + 15;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(colors.muted);

    addressLines.slice(1).forEach((line) => {
      doc.text(String(line), left, addressY, {
        width: contentWidth,
      });

      addressY = doc.y + 3;
    });

    y = Math.max(addressY, y + 45) + 12;

    // Products table heading
    y = sectionHeading("ORDER ITEMS", y);

    const tableX = left;
    const productWidth = 240;
    const qtyWidth = 45;
    const priceWidth = 95;
    const totalWidth =
      contentWidth -
      productWidth -
      qtyWidth -
      priceWidth;

    const productX = tableX + 10;
    const qtyX = tableX + productWidth;
    const priceX = qtyX + qtyWidth;
    const totalX = priceX + priceWidth;

    const drawTableHeader = () => {
      doc
        .rect(tableX, y, contentWidth, 27)
        .fill(colors.dark);

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(colors.white)
        .text("PRODUCT", productX, y + 9, {
          width: productWidth - 15,
        })
        .text("QTY", qtyX, y + 9, {
          width: qtyWidth,
          align: "center",
        })
        .text("UNIT PRICE", priceX, y + 9, {
          width: priceWidth - 8,
          align: "right",
        })
        .text("TOTAL", totalX, y + 9, {
          width: totalWidth - 10,
          align: "right",
        });

      y += 27;
    };

    drawTableHeader();

    const items = order.items || [];

    for (const [index, item] of items.entries()) {
      const productName = String(
        item.productName || "Laptop"
      );

      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const itemTotal =
        item.itemTotal != null
          ? Number(item.itemTotal)
          : price * quantity;

      const nameHeight = doc
        .font("Helvetica")
        .fontSize(9)
        .heightOfString(productName, {
          width: productWidth - 20,
        });

      const rowHeight = Math.max(34, nameHeight + 18);

      // Add a page if the next row will not fit
      if (y + rowHeight > doc.page.height - 65) {
        doc.addPage();
        y = 45;
        drawTableHeader();
      }

      if (index % 2 === 0) {
        doc
          .rect(tableX, y, contentWidth, rowHeight)
          .fill(colors.light);
      }

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(colors.text)
        .text(productName, productX, y + 10, {
          width: productWidth - 20,
        })
        .text(String(quantity), qtyX, y + 10, {
          width: qtyWidth,
          align: "center",
        })
        .text(money(price), priceX, y + 10, {
          width: priceWidth - 8,
          align: "right",
        })
        .text(money(itemTotal), totalX, y + 10, {
          width: totalWidth - 10,
          align: "right",
        });

      y += rowHeight;
    }

    if (items.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(colors.muted)
        .text("No items found for this order.", left, y + 10);

      y += 35;
    }

    y += 22;

    // Keep summary together on a new page if necessary
    const summaryHeight = 175;

    if (y + summaryHeight > doc.page.height - 65) {
      doc.addPage();
      y = 55;
    }

    const summaryWidth = 250;
    const summaryX = right - summaryWidth;

    doc
      .roundedRect(
        summaryX,
        y,
        summaryWidth,
        summaryHeight,
        6
      )
      .fill(colors.light);

    let summaryY = y + 16;

    const drawSummaryRow = (
      label,
      amount,
      options = {}
    ) => {
      doc
        .font(
          options.bold
            ? "Helvetica-Bold"
            : "Helvetica"
        )
        .fontSize(options.bold ? 11 : 9)
        .fillColor(
          options.color || colors.text
        )
        .text(label, summaryX + 12, summaryY, {
          width: 140,
        })
        .text(
          money(amount),
          summaryX + 145,
          summaryY,
          {
            width: summaryWidth - 157,
            align: "right",
          }
        );

      summaryY += options.bold ? 27 : 22;
    };

    drawSummaryRow("Subtotal", order.subtotal);

    drawSummaryRow(
      "Coupon Discount",
      order.discount,
      { color: colors.green }
    );

    drawSummaryRow(
      "Referral Discount",
      order.referralDiscount,
      { color: colors.green }
    );

    drawSummaryRow(
      "Delivery Charge",
      order.deliveryCharge
    );

    doc
      .moveTo(summaryX + 12, summaryY - 4)
      .lineTo(summaryX + summaryWidth - 12, summaryY - 4)
      .lineWidth(0.8)
      .strokeColor(colors.border)
      .stroke();

    summaryY += 5;

    drawSummaryRow(
      "TOTAL AMOUNT",
      order.totalAmount,
      {
        bold: true,
        color: colors.red,
      }
    );

    y += summaryHeight + 28;

    // Thank-you section
    if (y + 55 > doc.page.height - 45) {
      doc.addPage();
      y = 55;
    }

    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .lineWidth(0.8)
      .strokeColor(colors.border)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(colors.dark)
      .text(
        "Thank you for shopping with LAPZONE!",
        left,
        y + 15,
        {
          width: contentWidth,
          align: "center",
        }
      );

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(colors.muted)
      .text(
        "We appreciate your business.",
        left,
        y + 32,
        {
          width: contentWidth,
          align: "center",
        }
      );

    // Add a footer to every page
    const pageRange = doc.bufferedPageRange();

    for (
      let pageIndex = pageRange.start;
      pageIndex < pageRange.start + pageRange.count;
      pageIndex++
    ) {
      doc.switchToPage(pageIndex);

      const footerY = doc.page.height - 30;

      doc
        .moveTo(left, footerY - 8)
        .lineTo(right, footerY - 8)
        .lineWidth(0.5)
        .strokeColor(colors.border)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(colors.muted)
        .text(
          "LAPZONE | Computer and Laptop Store",
          left,
          footerY,
          {
            width: contentWidth / 2,
            lineBreak: false,
          }
        );

      doc
        .text(
          `Page ${pageIndex + 1}`,
          left + contentWidth / 2,
          footerY,
          {
            width: contentWidth / 2,
            align: "right",
            lineBreak: false,
          }
        );
    }

    doc.end();
  } catch (error) {
    console.error("Download invoice error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate invoice",
      });
    }

    res.end();
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