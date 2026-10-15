import Offer from "../models/Offer.js";
import Product from "../models/Product.js";

// CREATE OFFER
export const createOffer = async (req, res) => {
  try {
    const {
      name,
      offerType,
      productId,
      category,
      discountType,
      discountValue,
      startDate,
      expiryDate,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !offerType ||
      !discountType ||
      discountValue === undefined ||
      !startDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Validate offer type
    if (!["PRODUCT", "CATEGORY"].includes(offerType)) {
      return res.status(400).json({
        message: "Invalid offer type",
      });
    }

    // Validate discount type
    if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
      return res.status(400).json({
        message: "Invalid discount type",
      });
    }

    // Validate discount value
    if (Number(discountValue) <= 0) {
      return res.status(400).json({
        message: "Discount value must be greater than 0",
      });
    }

    // Percentage cannot be more than 100
    if (
      discountType === "PERCENTAGE" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        message: "Percentage discount cannot be more than 100%",
      });
    }

    // PRODUCT offer validation
    if (offerType === "PRODUCT") {
      if (!productId) {
        return res.status(400).json({
          message: "Product ID is required for product offer",
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
    }

    // CATEGORY offer validation
    if (offerType === "CATEGORY") {
      if (!category) {
        return res.status(400).json({
          message: "Category is required for category offer",
        });
      }
    }

    // Date validation
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);

    if (isNaN(start.getTime()) || isNaN(expiry.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    if (expiry <= start) {
      return res.status(400).json({
        message: "Expiry date must be after start date",
      });
    }

    // Create offer
    const offer = await Offer.create({
      name: name.trim(),
      offerType,
      productId: offerType === "PRODUCT" ? productId : null,
      category:
        offerType === "CATEGORY" ? category.trim() : null,
      discountType,
      discountValue: Number(discountValue),
      startDate: start,
      expiryDate: expiry,
      isActive: true,
    });

    return res.status(201).json({
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    console.error("Create offer error:", error);

    return res.status(500).json({
      message: "Failed to create offer",
    });
  }
};

// GET ALL OFFERS
export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("productId", "name brand price category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      offers,
    });
  } catch (error) {
    console.error("Get offers error:", error);

    return res.status(500).json({
      message: "Failed to fetch offers",
    });
  }
};

// GET SINGLE OFFER
export const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "productId",
      "name brand price category"
    );

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    return res.status(200).json({
      offer,
    });
  } catch (error) {
    console.error("Get offer error:", error);

    return res.status(500).json({
      message: "Failed to fetch offer",
    });
  }
};

// UPDATE OFFER
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    const {
      name,
      discountType,
      discountValue,
      startDate,
      expiryDate,
      isActive,
    } = req.body;

    if (name !== undefined) {
      offer.name = name.trim();
    }

    if (discountType !== undefined) {
      if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
        return res.status(400).json({
          message: "Invalid discount type",
        });
      }

      offer.discountType = discountType;
    }

    if (discountValue !== undefined) {
      if (Number(discountValue) <= 0) {
        return res.status(400).json({
          message: "Discount value must be greater than 0",
        });
      }

      if (
        offer.discountType === "PERCENTAGE" &&
        Number(discountValue) > 100
      ) {
        return res.status(400).json({
          message: "Percentage discount cannot be more than 100%",
        });
      }

      offer.discountValue = Number(discountValue);
    }

    if (startDate !== undefined) {
      offer.startDate = new Date(startDate);
    }

    if (expiryDate !== undefined) {
      offer.expiryDate = new Date(expiryDate);
    }

    if (offer.expiryDate <= offer.startDate) {
      return res.status(400).json({
        message: "Expiry date must be after start date",
      });
    }

    if (isActive !== undefined) {
      offer.isActive = isActive;
    }

    await offer.save();

    return res.status(200).json({
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    console.error("Update offer error:", error);

    return res.status(500).json({
      message: "Failed to update offer",
    });
  }
};

// DELETE OFFER
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    await Offer.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);

    return res.status(500).json({
      message: "Failed to delete offer",
    });
  }
};