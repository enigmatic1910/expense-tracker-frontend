import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Length should be greater than 1")
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

  password: z.string().min(8, "Password should be at least of 8 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(1, "Length should be greater than 1").trim(),

  email: z
    .string()
    .min(1, "Length should be greater than 1")
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

  password: z.string().min(8, "Password should be at least of 8 characters"),
});

export type loginInput = z.input<typeof loginSchema>;

export type loginOutput = z.output<typeof loginSchema>;

export type registerInput = z.input<typeof registerSchema>;

export type registerOutput = z.output<typeof registerSchema>;
