import { z } from "zod";

const addressSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters"),

  phone: z
  .string()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^\d+$/, "Phone number must contain only numbers"),

  addressLine: z
    .string()
    .min(5, "Address must be at least 5 characters"),

  city: z
    .string()
    .min(2, "City is required"),

  state: z
    .string()
    .min(2, "State is required"),

  pincode: z
    .string()
    .length(6, "Pincode must be exactly 6 digits")
    .regex(/^\d+$/, "Pincode must contain only numbers"),

  isDefault: z
    .boolean()
    .optional(),
});

export default addressSchema;