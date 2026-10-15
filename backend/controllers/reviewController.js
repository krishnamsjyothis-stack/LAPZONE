
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ==========================================
// CHECK WHETHER CUSTOMER CAN REVIEW PRODUCT
// ==========================================
const canReviewProduct = async (userId, productId) => {
  const deliveredOrder = await Order.findOne({
    userId,
    orderStatus: "Delivered",
    items: {
      $elemMatch: {
        productId: new mongoose.Types.ObjectId(productId),
        cancelled: { $ne: true },
      },
    },
  }).select("_id");

  return Boolean(deliveredOrder);
};

// ==========================================
// CREATE REVIEW
// ==========================================
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.userId;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const parsedRating = Number(rating);

    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5.",
      });
    }

    if (
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Title must contain 3 to 100 characters.",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length < 10 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Comment must contain 10 to 1000 characters.",
      });
    }

    const product = await Product.findById(productId).select("_id");

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const eligible = await canReviewProduct(userId, productId);

    if (!eligible) {
      return res.status(403).json({
        message: "You can review this laptop only after its order is delivered.",
      });
    }

    const existingReview = await Review.findOne({
      userId,
      productId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this laptop.",
      });
    }

    const review = await Review.create({
      userId,
      productId,
      rating: parsedRating,
      title: title.trim(),
      comment: comment.trim(),
      status: "Pending",
    });

    return res.status(201).json({
      message: "Review submitted successfully. It is awaiting admin approval.",
      review,
    });
  } catch (error) {
    // Handles duplicate submissions that race with each other.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this laptop.",
      });
    }

    console.error("Create review error:", error.message);

    return res.status(500).json({
      message: "Unable to submit review.",
    });
  }
};

// ==========================================
// GET APPROVED REVIEWS FOR A PRODUCT
// ==========================================
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(productId).select("_id");

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const reviews = await Review.find({
      productId,
      status: "Approved",
    })
      .populate("userId", "name")
      .select("userId rating title comment createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            ).toFixed(1)
          );

    return res.status(200).json({
      reviews,
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.error("Get product reviews error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch product reviews.",
    });
  }
};

// ==========================================
// GET CURRENT CUSTOMER'S REVIEWS
// ==========================================
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      userId: req.userId,
    })
      .populate("productId", "name brand images")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get my reviews error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch your reviews.",
    });
  }
};

// ==========================================
// EDIT CURRENT CUSTOMER'S REVIEW
// ==========================================
export const updateMyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    if (rating !== undefined) {
      const parsedRating = Number(rating);

      if (
        !Number.isInteger(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        return res.status(400).json({
          message: "Rating must be a whole number from 1 to 5.",
        });
      }

      review.rating = parsedRating;
    }

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        title.trim().length < 3 ||
        title.trim().length > 100
      ) {
        return res.status(400).json({
          message: "Title must contain 3 to 100 characters.",
        });
      }

      review.title = title.trim();
    }

    if (comment !== undefined) {
      if (
        typeof comment !== "string" ||
        comment.trim().length < 10 ||
        comment.trim().length > 1000
      ) {
        return res.status(400).json({
          message: "Comment must contain 10 to 1000 characters.",
        });
      }

      review.comment = comment.trim();
    }

    // An edited review must be approved again.
    review.status = "Pending";

    await review.save();

    return res.status(200).json({
      message: "Review updated and sent for approval.",
      review,
    });
  } catch (error) {
    console.error("Update my review error:", error.message);

    return res.status(500).json({
      message: "Unable to update your review.",
    });
  }
};

// ==========================================
// DELETE CURRENT CUSTOMER'S REVIEW
// ==========================================
export const deleteMyReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete my review error:", error.message);

    return res.status(500).json({
      message: "Unable to delete your review.",
    });
  }
};
