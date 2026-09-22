import { z } from "zod";
import { isPasswordValid } from "@/lib/validators";

export const resetPasswordSchema = z
  .object({
    password: z.string().refine(isPasswordValid, "Password does not meet all requirements."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
