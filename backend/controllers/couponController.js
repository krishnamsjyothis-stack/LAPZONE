import Coupon from "../models/Coupon.js";

// ==========================================
// CREATE COUPON
// ==========================================

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      startDate,
      expiryDate,
    } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({
        message: "Required coupon fields are missing",
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        message: "Coupon code already exists",
      });
    }

    if (
      discountType === "PERCENTAGE" &&
      discountValue > 100
    ) {
      return res.status(400).json({
        message: "Percentage discount cannot exceed 100%",
      });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        message: "Discount value must be greater than 0",
      });
    }

    if (
      minimumOrderAmount !== undefined &&
      minimumOrderAmount < 0
    ) {
      return res.status(400).json({
        message: "Minimum order amount cannot be negative",
      });
    }

    if (usageLimit !== undefined && usageLimit !== null) {
      if (usageLimit < 1) {
        return res.status(400).json({
          message: "Usage limit must be at least 1",
        });
      }
    }

    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        message: "Expiry date must be in the future",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscount:
        maximumDiscount !== undefined
          ? maximumDiscount
          : null,
      usageLimit:
        usageLimit !== undefined
          ? usageLimit
          : null,
      startDate: startDate || new Date(),
      expiryDate,
      isActive: true,
    });

    return res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);

    return res.status(500).json({
      message: "Failed to create coupon",
    });
  }
};

// ==========================================
// GET ALL COUPONS
// ==========================================

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Coupons fetched successfully",
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);

    return res.status(500).json({
      message: "Failed to fetch coupons",
    });
  }
};

// ==========================================
// DELETE COUPON
// ==========================================

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    await Coupon.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    return res.status(500).json({
      message: "Failed to delete coupon",
    });
  }
};

// ==========================================
// APPLY / VALIDATE COUPON
// ==========================================

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Coupon code is required",
      });
    }

    if (
      orderAmount === undefined ||
      orderAmount === null
    ) {
      return res.status(400).json({
        message: "Order amount is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon) {
      return res.status(404).json({
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

    if (
      orderAmount < coupon.minimumOrderAmount
    ) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }

    let discount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discount =
        (orderAmount * coupon.discountValue) / 100;

      if (
        coupon.maximumDiscount !== null &&
        discount > coupon.maximumDiscount
      ) {
        discount = coupon.maximumDiscount;
      }
    }

    if (coupon.discountType === "FIXED") {
      discount = coupon.discountValue;
    }

    if (discount > orderAmount) {
      discount = orderAmount;
    }

    const finalAmount = orderAmount - discount;

    return res.status(200).json({
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);

    return res.status(500).json({
      message: "Failed to validate coupon",
    });
  }
};

export {
  createCoupon,
  getCoupons,
  deleteCoupon,
  validateCoupon,
};