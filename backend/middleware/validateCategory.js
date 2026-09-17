import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters")
    .trim(),
});

const validateCategory = (req, res, next) => {
  const result = categorySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Category validation failed",
      errors: result.error.issues,
    });
  }

  req.body = result.data;

  next();
};

export default validateCategory;