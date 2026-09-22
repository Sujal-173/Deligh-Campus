import { z } from "zod";
import { NAME_REGEX, MOBILE_REGEX, isPasswordValid } from "@/lib/validators";

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .regex(
        NAME_REGEX,
        "Name can only contain letters, spaces, apostrophes, periods, and hyphens.",
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address."),
    mobile: z
      .string()
      .trim()
      .regex(MOBILE_REGEX, "Enter a valid 10-digit mobile number."),
    password: z
      .string()
      .min(1, "Password is required.")
      .refine(isPasswordValid, "Password must meet every requirement below."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    role: z.enum(["student", "trainer", "recruiter", "institution"], {
      required_error: "Please select a role.",
    }),
    agreeToTerms: z
      .boolean()
      .refine((accepted) => accepted, {
        message: "You must agree to the Terms of Use and Privacy Policy.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type SignupSchema = z.infer<typeof signupSchema>;
