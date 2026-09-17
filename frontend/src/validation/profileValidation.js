import { z } from "zod";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .regex(
      /^[A-Za-z ]+$/,
      "Name can contain only letters and spaces"
    ),

  phone: z
    .string()
    .trim()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(
      /^\d+$/,
      "Phone number must contain only numbers"
    ),
});

export default profileSchema;