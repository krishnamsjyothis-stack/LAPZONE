import Category from "../models/Category.js";

// ADD CATEGORY
// ADD CATEGORY
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const trimmedName = name.trim();

    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${trimmedName}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: trimmedName,
    });

    return res.status(201).json({
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    console.error("Add category error:", error);

    return res.status(500).json({
      message: "Failed to add category",
    });
  }
};
// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${name}$`,
        $options: "i",
      },
      _id: { $ne: id },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    category.name = name;

    await category.save();

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      message: "Failed to update category",
    });
  }
};
// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const { search } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    const totalCategories = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCategories / limit);

    return res.status(200).json({
      message: "Categories fetched successfully",
      categories,
      currentPage: page,
      totalPages,
      totalCategories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};
// SOFT DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    category.isActive = false;

    await category.save();

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      message: "Failed to delete category",
    });
  }
};
export {
  addCategory,
  updateCategory,
  getCategories,
  deleteCategory,
};