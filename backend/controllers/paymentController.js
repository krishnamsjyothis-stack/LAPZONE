import crypto from "crypto";
import Razorpay from "razorpay";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Referral from "../models/Referral.js";

import { getBestOffer } from "../utils/offerUtils.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { couponCode } = req.body;

    // --------------------------------------------------
    // GET USER CART
    // --------------------------------------------------
    const cart = await Cart.findOne({
      userId: req.userId,
    }).populate("items.productId");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    // --------------------------------------------------
    // CALCULATE SUBTOTAL
    // USING OFFER PRICE
    // --------------------------------------------------
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          message:
            "One of the products in your cart no longer exists",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message: `${product.name} is currently unavailable`,
        });
      }

      if (product.stock <= 0) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message:
            `Only ${product.stock} unit(s) of ${product.name} are available`,
        });
      }

      // Get best active offer
      const offer = await getBestOffer(product);

      const price = offer.hasOffer
        ? offer.finalPrice
        : product.price;

      const itemTotal = price * item.quantity;

      subtotal += itemTotal;
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
          message:
            "This coupon usage limit has been reached",
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
  referredUser: req.userId,
  isActive: true,
  discountUsed: false,
  expiryDate: { $gte: new Date() },
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
    // DELIVERY
    // --------------------------------------------------
    const deliveryCharge = 0;

    // --------------------------------------------------
    // FINAL TOTAL
    // --------------------------------------------------
    let totalAmount =
      subtotal -
      discount -
      referralDiscount +
      deliveryCharge;

    if (totalAmount < 0) {
      totalAmount = 0;
    }

    totalAmount = Math.round(totalAmount);

    // --------------------------------------------------
    // DEBUG
    // --------------------------------------------------
    console.log(
      "========== RAZORPAY AMOUNT DEBUG =========="
    );

    console.log("Subtotal:", subtotal);
    console.log("Coupon Discount:", discount);
    console.log("Referral Discount:", referralDiscount);
    console.log("Delivery Charge:", deliveryCharge);
    console.log("Total Amount:", totalAmount);
    console.log(
      "Amount in Paise:",
      Math.round(totalAmount * 100)
    );
    console.log("Coupon Code:", appliedCouponCode);
    console.log("Referral Code:", appliedReferralCode);

    console.log(
      "============================================"
    );

    // --------------------------------------------------
    // VALIDATE FINAL AMOUNT
    // --------------------------------------------------
    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    // --------------------------------------------------
    // CREATE RAZORPAY ORDER
    // --------------------------------------------------
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `lapzone_${Date.now()}`,
    };

    console.log(
      "Creating Razorpay order with:",
      options
    );

    const razorpayOrder =
      await razorpay.orders.create(options);

    console.log(
      "Razorpay order created:",
      razorpayOrder.id
    );

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------
    return res.status(201).json({
      message:
        "Razorpay order created successfully",

      order: razorpayOrder,

      amount: totalAmount,

      discount,

      referralDiscount,

      couponCode: appliedCouponCode,

      referralCode: appliedReferralCode,
    });
  } catch (error) {
    console.error(
      "Razorpay order creation error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create Razorpay order",
    });
  }
};

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
      couponCode,
    } = req.body;

    // --------------------------------------------------
    // CHECK PAYMENT DETAILS
    // --------------------------------------------------
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message:
          "Payment verification details are missing",
      });
    }

    // --------------------------------------------------
    // CHECK ADDRESS
    // --------------------------------------------------
    if (!addressId) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Delivery address not found",
      });
    }

    // --------------------------------------------------
    // VERIFY RAZORPAY SIGNATURE
    // --------------------------------------------------
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    // --------------------------------------------------
    // GET USER CART
    // --------------------------------------------------
    const cart = await Cart.findOne({
      userId: req.userId,
    }).populate("items.productId");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    // --------------------------------------------------
    // CREATE ORDER ITEMS
    // --------------------------------------------------
    const orderItems = [];

    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.productId;

      // Product exists
      if (!product) {
        return res.status(400).json({
          message:
            "One of the products in your cart no longer exists",
        });
      }

      // Product active
      if (!product.isActive) {
        return res.status(400).json({
          message:
            `${product.name} is currently unavailable`,
        });
      }

      // Stock check
      if (product.stock <= 0) {
        return res.status(400).json({
          message:
            `${product.name} is out of stock`,
        });
      }

      // Quantity check
      if (item.quantity > product.stock) {
        return res.status(400).json({
          message:
            `Only ${product.stock} unit(s) of ${product.name} are available`,
        });
      }

      // Get best active offer
      const offer = await getBestOffer(product);

      // Use offer price
      const price = offer.hasOffer
        ? offer.finalPrice
        : product.price;

      const itemTotal =
        price * item.quantity;

      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage:
          product.images?.[0] ||
          product.image ||
          "",
        price,
        quantity: item.quantity,
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
          message:
            "This coupon is not active yet",
        });
      }

      if (now > coupon.expiryDate) {
        return res.status(400).json({
          message:
            "This coupon has expired",
        });
      }

      if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          message:
            "This coupon usage limit has been reached",
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
    let referralDiscount = 0;
    let appliedReferralCode = "";

    const referral = await Referral.findOne({
      referredUser: req.userId,
      isActive: true,
      discountUsed: false,
      expiryDate: {
        $gte: new Date(),
      },
    });

    if (referral) {
      // Percentage referral discount
      if (referral.discountType === "PERCENTAGE") {
        referralDiscount =
          (subtotal * referral.discountValue) / 100;

        // Maximum referral discount
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

      // ------------------------------------------------
      // Referral discount cannot exceed the amount
      // remaining after coupon discount
      // ------------------------------------------------
      const remainingAmount = Math.max(
        subtotal - discount,
        0
      );

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
    // DELIVERY
    // --------------------------------------------------
    const deliveryCharge = 0;

    // --------------------------------------------------
    // FINAL TOTAL
    // --------------------------------------------------
    let totalAmount =
      subtotal -
      discount -
      referralDiscount +
      deliveryCharge;

    if (totalAmount < 0) {
      totalAmount = 0;
    }

    totalAmount = Math.round(totalAmount);

    // --------------------------------------------------
    // VERIFY RAZORPAY ORDER AMOUNT
    // --------------------------------------------------
    const razorpayOrder =
      await razorpay.orders.fetch(
        razorpay_order_id
      );

    const expectedAmount =
      Math.round(totalAmount * 100);

    console.log(
      "========== RAZORPAY VERIFY DEBUG =========="
    );

    console.log(
      "Razorpay order amount:",
      razorpayOrder.amount
    );

    console.log(
      "Expected amount:",
      expectedAmount
    );

    console.log(
      "Subtotal:",
      subtotal
    );

    console.log(
      "Coupon Discount:",
      discount
    );

    console.log(
      "Referral Discount:",
      referralDiscount
    );

    console.log(
      "Total amount:",
      totalAmount
    );

    console.log(
      "Coupon Code:",
      appliedCouponCode
    );

    console.log(
      "Referral Code:",
      appliedReferralCode
    );

    console.log(
      "============================================"
    );

    if (
      razorpayOrder.amount !== expectedAmount
    ) {
      return res.status(400).json({
        message:
          "Payment amount does not match the order amount",
      });
    }

    // --------------------------------------------------
    // CREATE LAPZONE ORDER ID
    // --------------------------------------------------
    const orderId =
      `LAP-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    // --------------------------------------------------
    // SHIPPING ADDRESS SNAPSHOT
    // --------------------------------------------------
    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };

    // --------------------------------------------------
    // CREATE LAPZONE ORDER
    // --------------------------------------------------
    const order = await Order.create({
      orderId,

      userId: req.userId,

      items: orderItems,

      shippingAddress,

      subtotal,

      discount,

      couponCode: appliedCouponCode,

      referralCode: appliedReferralCode,

      referralDiscount,

      deliveryCharge,

      totalAmount,

      paymentMethod: "RAZORPAY",

      paymentStatus: "Paid",

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
          referredUser: req.userId,
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
    // CLEAR CART
    // --------------------------------------------------
    cart.items = [];

    await cart.save();

    // --------------------------------------------------
    // SUCCESS RESPONSE
    // --------------------------------------------------
    return res.status(200).json({
      message:
        "Payment verified and order created successfully",

      verified: true,

      order: {
        _id: order._id,
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Razorpay payment verification error:",
      error
    );

    return res.status(500).json({
      message:
        "Payment verification failed",
    });
  }
};