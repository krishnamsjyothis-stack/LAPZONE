  import mongoose from "mongoose";

  const productSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      brand: {
        type: String,
        required: true,
        trim: true,
      },

      category: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      images: {
        type: [String],
        default: [],
      },

      specifications: {
        processor: {
          type: String,
          trim: true,
        },

        ram: {
          type: String,
          trim: true,
        },

        storage: {
          type: String,
          trim: true,
        },

        display: {
          type: String,
          trim: true,
        },

        graphics: {
          type: String,
          trim: true,
        },

        operatingSystem: {
          type: String,
          trim: true,
        },
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

  const Product = mongoose.model("Product", productSchema);

  export default Product;