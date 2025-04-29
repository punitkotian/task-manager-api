const { z } = require("zod");

const { mongoIdSchema } = require("./common.validator");

const workspaceNameSchema = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name cannot exceed 50 characters")
  .regex(
    /^[a-zA-Z0-9\s_-]+$/,
    "Only letters, numbers, spaces, hyphens, and underscores are allowed."
  );

const descriptionSchema = z
  .string()
  .trim()
  .max(500, "Description cannot exceed 500 characters")
  .optional();

const createWorkspaceSchema = {
  body: z.object({
    name: workspaceNameSchema,
    description: descriptionSchema,
  }),
};

const getWorkspaceSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
};

const updateWorkspaceSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
  body: z
    .object({
      name: workspaceNameSchema.optional(),
      description: descriptionSchema.optional(),
      regenerateInviteCode: z.boolean().default(false),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field required"
    ),
};

const regenerateInviteCodeSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
};

const deleteWorkspaceSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
};

const joinWorkspaceSchema = {
  params: z.object({
    inviteCode: z
      .string()
      .trim()
      .length(8, "Invite code must be exactly 8 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Only letters, numbers, and underscores allowed"
      ),
  }),
};

module.exports = {
  createWorkspaceSchema,
  getWorkspaceSchema,
  updateWorkspaceSchema,
  deleteWorkspaceSchema,
  joinWorkspaceSchema,
  regenerateInviteCodeSchema,
};
