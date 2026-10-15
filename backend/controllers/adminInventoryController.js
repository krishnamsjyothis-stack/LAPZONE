import Product from "../models/Product.js";



const getInventory = async (req, res) => {
  try {
    const {
      search,
      stockFilter = "all",
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Search
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Stock filter
    if (stockFilter === "out") {
      query.stock = 0;
    }

    if (stockFilter === "low") {
      query.stock = {
        $gte: 1,
        $lte: 5,
      };
    }

    if (stockFilter === "in") {
      query.stock = {
        $gte: 6,
      };
    }

    // Pagination
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);

    const skip =
      (pageNumber - 1) * limitNumber;

    // Total matching products
    const totalProducts =
      await Product.countDocuments(query);

    // Products for current page
    const products = await Product.find(query)
      .select(
        "name brand category price stock images isActive createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(
      totalProducts / limitNumber
    );

    return res.status(200).json({
      message: "Inventory fetched successfully",

      products,

      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalProducts,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      message: "Failed to fetch inventory",
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        message: "Stock is required",
      });
    }

    if (
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        message: "Stock must be a non-negative integer",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.stock = Number(stock);

    await product.save();

    return res.status(200).json({
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update stock error:", error);

    return res.status(500).json({
      message: "Failed to update stock",
    });
  }
};

export {
  getInventory,
  updateStock,
};