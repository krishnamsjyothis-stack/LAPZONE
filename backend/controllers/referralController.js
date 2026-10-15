import Referral from "../models/Referral.js";
import crypto from "crypto";

// ================= CREATE REFERRAL =================

export const createReferral = async (req, res) => {
  try {
    const {
      discountType,
      discountValue,
      maximumDiscount,
      expiryDate,
    } = req.body;

    // Validation
    if (!discountType || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Discount type, discount value and expiry date are required",
      });
    }

    // Generate unique referral code
    const referralCode =
      "LAP" +
      crypto.randomBytes(5).toString("hex").toUpperCase();

    const referral = await Referral.create({
      referralCode,
      referrer: req.userId,
      discountType,
      discountValue,
      maximumDiscount: maximumDiscount || null,
      expiryDate,
    });

    res.status(201).json({
      success: true,
      message: "Referral created successfully",
      referral,
    });
  } catch (error) {
    console.error("Create referral error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create referral",
    });
  }
};

// ================= GET MY REFERRALS =================

export const getMyReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({
      referrer: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      referrals,
    });
  } catch (error) {
    console.error("Get referrals error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get referrals",
    });
  }
};

// ================= GET REFERRAL BY CODE =================

export const getReferralByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const referral = await Referral.findOne({
      referralCode: code.toUpperCase(),
      isActive: true,
      isUsed: false,
      expiryDate: {
        $gte: new Date(),
      },
    });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired referral code",
      });
    }

    res.status(200).json({
      success: true,
      referral: {
        referralCode: referral.referralCode,
        discountType: referral.discountType,
        discountValue: referral.discountValue,
        maximumDiscount: referral.maximumDiscount,
        expiryDate: referral.expiryDate,
      },
    });
  } catch (error) {
    console.error("Get referral error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get referral",
    });
  }
};