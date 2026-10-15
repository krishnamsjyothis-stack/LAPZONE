
import Product from "../models/Product.js";
import { getBestOffer } from "../utils/offerUtils.js";

// ================= CREATE PRODUCT =================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      price,
      stock,
      images,
      specifications,
    } = req.body;

    const product = await Product.create({
      name,
      brand,
      category,
      description,
      price,
      stock,
      images,
      specifications,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};

// ================= GET ALL PRODUCTS =================

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category,
      brand,
      processor,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    // Validate pagination
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 6);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Invalid page or limit.",
      });
    }

    // Validate minimum and maximum prices
    const min =
      minPrice === undefined || minPrice === ""
        ? undefined
        : Number(minPrice);

    const max =
      maxPrice === undefined || maxPrice === ""
        ? undefined
        : Number(maxPrice);

    if (
      (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
      (max !== undefined && (!Number.isFinite(max) || max < 0))
    ) {
      return res.status(400).json({
        message: "Prices must be valid non-negative numbers.",
      });
    }

    if (min !== undefined && max !== undefined && min > max) {
      return res.status(400).json({
        message: "Minimum price cannot exceed maximum price.",
      });
    }

    // Build the product filter
    const filter = {
      isActive: true,
    };

    // Search by product name or brand
    // Escape special regex characters in user input
    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    if (escapedSearch.trim()) {
      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by brand
    if (brand) {
      filter.brand = brand;
    }

    // Filter by processor
    // Example: Intel Core i5, Intel Core i7, AMD Ryzen 7
    if (processor) {
      const escapedProcessor = processor.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter["specifications.processor"] = {
        $regex: escapedProcessor,
        $options: "i",
      };
    }

    // Filter by price range
    if (min !== undefined || max !== undefined) {
      filter.price = {};

      if (min !== undefined) {
        filter.price.$gte = min;
      }

      if (max !== undefined) {
        filter.price.$lte = max;
      }
    }

    // Sorting options
    const sortOptions = {
      "price-low": { price: 1, _id: 1 },
      "price-high": { price: -1, _id: 1 },
      "name-asc": { name: 1, _id: 1 },
      "name-desc": { name: -1, _id: 1 },
    };

    const sortOption = sortOptions[sort] || {
      createdAt: -1,
      _id: -1,
    };

    // Pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    // Fetch products from MongoDB
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Attach the best applicable offer to each product
    const productsWithOffers = await Promise.all(
      products.map(async (product) => {
        const offer = await getBestOffer(product);

        return {
          ...product.toObject(),
          offer,
        };
      })
    );

    return res.status(200).json({
      message: "Products fetched successfully",
      products: productsWithOffers,
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// ================= GET SINGLE PRODUCT =================

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const offer = await getBestOffer(product);

    const productWithOffer = {
      ...product.toObject(),
      offer,
    };

    return res.status(200).json({
      message: "Product fetched successfully",
      product: productWithOffer,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

// ================= UPDATE PRODUCT =================

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      brand,
      category,
      price,
      stock,
      description,
      specifications,
      existingImages,
    } = req.body;

    // Parse specifications
    let parsedSpecifications = existingProduct.specifications;

    if (specifications !== undefined) {
      try {
        parsedSpecifications =
          typeof specifications === "string"
            ? JSON.parse(specifications)
            : specifications;

        if (
          parsedSpecifications === null ||
          typeof parsedSpecifications !== "object" ||
          Array.isArray(parsedSpecifications)
        ) {
          return res.status(400).json({
            message: "Specifications must be a valid object.",
          });
        }
      } catch (error) {
        return res.status(400).json({
          message: "Invalid specifications format.",
        });
      }
    }

    // Parse existing images
    let keptImages = existingProduct.images || [];

    if (existingImages !== undefined) {
      try {
        keptImages =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;

        if (!Array.isArray(keptImages)) {
          return res.status(400).json({
            message: "Invalid existing images format.",
          });
        }
      } catch (error) {
        return res.status(400).json({
          message: "Invalid existing images format.",
        });
      }
    }

    // Add newly uploaded images
    const newImages = req.files
      ? req.files.map(
          (file) => `/uploads/products/${file.filename}`
        )
      : [];

    // Combine retained and newly uploaded images
    const finalImages = [...keptImages, ...newImages];

    // Update basic product information
    existingProduct.name = name ?? existingProduct.name;
    existingProduct.brand = brand ?? existingProduct.brand;
    existingProduct.category = category ?? existingProduct.category;
    existingProduct.description =
      description ?? existingProduct.description;

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          message: "Price must be a valid non-negative number.",
        });
      }

      existingProduct.price = numericPrice;
    }

    if (stock !== undefined) {
      const numericStock = Number(stock);

      if (
        !Number.isInteger(numericStock) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          message: "Stock must be a non-negative integer.",
        });
      }

      existingProduct.stock = numericStock;
    }

    existingProduct.specifications = parsedSpecifications;
    existingProduct.images = finalImages;

    await existingProduct.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product: existingProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
};

// ================= DELETE PRODUCT =================

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Soft delete: hide the product without removing it from MongoDB
    product.isActive = false;

    await product.save();

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
