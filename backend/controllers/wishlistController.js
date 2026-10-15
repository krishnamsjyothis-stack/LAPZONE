import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Check product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Don't allow unavailable products
    if (!product.isActive) {
      return res.status(400).json({
        message: "Product is currently unavailable",
      });
    }

    // Find user's wishlist
    let wishlist = await Wishlist.findOne({
      userId: req.userId,
    });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.userId,
        products: [productId],
      });
    } else {
      // Check if already exists
      const alreadyExists = wishlist.products.some(
        (id) => id.toString() === productId
      );

      if (alreadyExists) {
        return res.status(400).json({
          message: "Product already exists in wishlist",
        });
      }

      wishlist.products.push(productId);

      await wishlist.save();
    }

    await wishlist.populate("products");

    return res.status(200).json({
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      message: "Failed to add product to wishlist",
    });
  }
};


const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      userId: req.userId,
    }).populate("products");

    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist fetched successfully",
        wishlist: {
          products: [],
        },
      });
    }

    // Only return active products
    wishlist.products = wishlist.products.filter(
      (product) => product && product.isActive
    );

    return res.status(200).json({
      message: "Wishlist fetched successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      message: "Failed to fetch wishlist",
    });
  }
};


const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      userId: req.userId,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    const exists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        message: "Product is not in wishlist",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    await wishlist.populate("products");

    return res.status(200).json({
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      message: "Failed to remove product from wishlist",
    });
  }
};

export {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};