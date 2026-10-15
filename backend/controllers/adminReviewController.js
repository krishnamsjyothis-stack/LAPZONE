
import mongoose from "mongoose";
import Review from "../models/Review.js";

// ==========================================
// GET ALL REVIEWS — ADMIN
// Supports search, status filter and pagination
// ==========================================
export const getAdminReviews = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = "1",
      limit = "10",
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const filter = {};

    if (["Pending", "Approved", "Rejected"].includes(status)) {
      filter.status = status;
    } else if (status) {
      return res.status(400).json({
        message: "Invalid review status.",
      });
    }

    const searchText = search.trim();

    if (searchText) {
      const safeSearch = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const matchingProducts = await mongoose
        .model("Product")
        .find({
          name: { $regex: safeSearch, $options: "i" },
        })
        .select("_id")
        .lean();

      const matchingUsers = await mongoose
        .model("User")
        .find({
          name: { $regex: safeSearch, $options: "i" },
        })
        .select("_id")
        .lean();

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { comment: { $regex: safeSearch, $options: "i" } },
        { productId: { $in: matchingProducts.map((p) => p._id) } },
        { userId: { $in: matchingUsers.map((u) => u._id) } },
      ];
    }

    const [reviews, total, pendingCount, approvedCount, rejectedCount] =
      await Promise.all([
        Review.find(filter)
          .populate("userId", "name email")
          .populate("productId", "name brand images")
          .sort({ createdAt: -1 })
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .lean(),

        Review.countDocuments(filter),
        Review.countDocuments({ status: "Pending" }),
        Review.countDocuments({ status: "Approved" }),
        Review.countDocuments({ status: "Rejected" }),
      ]);

    return res.status(200).json({
      reviews,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    console.error("Get admin reviews error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch reviews.",
    });
  }
};

// ==========================================
// APPROVE OR REJECT A REVIEW
// ==========================================
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected.",
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email")
      .populate("productId", "name brand");

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      message: `Review ${status.toLowerCase()} successfully.`,
      review,
    });
  } catch (error) {
    console.error("Update review status error:", error.message);

    return res.status(500).json({
      message: "Unable to update review status.",
    });
  }
};

// ==========================================
// DELETE A REVIEW — ADMIN
// ==========================================
export const deleteAdminReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin review error:", error.message);

    return res.status(500).json({
      message: "Unable to delete review.",
    });
  }
};
