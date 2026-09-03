const { z } = require("zod");

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores",
  );

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
    "Password must contain at least one lowercase, uppercase, number, and special character",
  );

const registerSchema = {
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
};

const loginSchema = {
  body: z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  }),
};

const updateUserSchema = {
  body: z
    .object({
      username: usernameSchema.optional(),
      email: emailSchema.optional(),
      password: passwordSchema.optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field required",
    ),
};

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
};
