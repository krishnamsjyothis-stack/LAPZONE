import { z } from "zod";

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  brand: z
    .string()
    .trim()
    .min(2, "Brand must be at least 2 characters")
    .max(50, "Brand cannot exceed 50 characters"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),

  price: z.coerce
    .number()
    .min(0, "Price cannot be negative"),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),

  images: z
    .array(z.string())
    .min(3, "Product must have at least 3 images"),

  specifications: z
    .object({
      processor: z.string().trim().optional(),
      ram: z.string().trim().optional(),
      storage: z.string().trim().optional(),
      display: z.string().trim().optional(),
      graphics: z.string().trim().optional(),
      operatingSystem: z.string().trim().optional(),
    })
    .optional(),
});

const validateProduct = (req, res, next) => {
  const result = productSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Product validation failed",
      errors: result.error.issues,
    });
  }

  req.body = result.data;

  next();
};

export default validateProduct;