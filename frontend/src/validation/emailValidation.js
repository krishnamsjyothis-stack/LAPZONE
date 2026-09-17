import { z } from "zod";

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
});

export default emailSchema;