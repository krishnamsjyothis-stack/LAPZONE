import { z } from "zod";

const cartSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required"),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

const validateCart = (req, res, next) => {
  const result = cartSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Cart validation failed",
      errors: result.error.issues,
    });
  }

  req.body = result.data;

  next();
};

export default validateCart;