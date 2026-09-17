import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ================= GET CART =================

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      userId: req.userId,
    }).populate("items.productId");

    if (!cart) {
      cart = await Cart.create({
        userId: req.userId,
        items: [],
      });
    }

    return res.status(200).json({
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      message: "Failed to fetch cart",
    });
  }
};

// ================= ADD TO CART =================

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const MAX_QUANTITY = 5;

if (quantity > MAX_QUANTITY) {
  return res.status(400).json({
    message: `Maximum ${MAX_QUANTITY} items allowed for a product`,
  });
}

    if (!product.isActive) {
  return res.status(400).json({
    message: "Product is currently unavailable",
  });
}

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    let cart = await Cart.findOne({
      userId: req.userId,
    });

    if (!cart) {
      cart = await Cart.create({
        userId: req.userId,
        items: [
          {
            productId,
            quantity,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
          return res.status(400).json({
            message: "Requested quantity exceeds available stock",
          });
        }

        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          productId,
          quantity,
        });
      }

      await cart.save();
    }

    await cart.populate("items.productId");

    return res.status(200).json({
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      message: "Failed to add product to cart",
    });
  }
};

// ================= UPDATE CART ITEM =================

const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const MAX_QUANTITY = 5;

if (quantity > MAX_QUANTITY) {
  return res.status(400).json({
    message: `Maximum ${MAX_QUANTITY} items allowed for a product`,
  });
}

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    const cart = await Cart.findOne({
      userId: req.userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Product is not in cart",
      });
    }

    item.quantity = quantity;

    await cart.save();
    await cart.populate("items.productId");

    return res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      message: "Failed to update cart",
    });
  }
};

// ================= REMOVE FROM CART =================

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      userId: req.userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemExists = cart.items.some(
      (item) => item.productId.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        message: "Product is not in cart",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    await cart.populate("items.productId");

    return res.status(200).json({
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    return res.status(500).json({
      message: "Failed to remove product from cart",
    });
  }
};

// ================= CLEAR CART =================

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      message: "Failed to clear cart",
    });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};