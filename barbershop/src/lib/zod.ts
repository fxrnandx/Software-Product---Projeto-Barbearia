import { email, object, string } from "zod"
 
export const signInSchema = object({
  email: email({ error: "Invalid email address" }),
  password: string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters")
    .refine((val) => /[A-Z]/.test(val), { error: "Must include an uppercase letter" })
    .refine((val) => /[a-z]/.test(val), { error: "Must include a lowercase letter" })
    .refine((val) => /[0-9]/.test(val), { error: "Must include a number" })
})