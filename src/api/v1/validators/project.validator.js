const { z } = require("zod");
const { mongoIdSchema } = require("./common.validator");
const { ProjectStatusList } = require("../../../config/enums/project");

const projectNameSchema = z
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

const createProjectSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
  body: z.object({
    name: projectNameSchema,
    description: descriptionSchema,
    status: z.enum(ProjectStatusList).optional(),
  }),
};

const getProjectSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
    projectId: mongoIdSchema,
  }),
};

const getProjectsSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
  query: z
    .object({
      status: z.enum(ProjectStatusList).optional(),
      name: projectNameSchema.optional(),
      page: z
        .preprocess((val) => parseInt(String(val), 10), z.number().min(1))
        .default(1),
      limit: z
        .preprocess((val) => parseInt(String(val), 10), z.number().min(1))
        .default(10),
    })
    .strict(),
};

const updateProjectSchema = {
  params: z.object({
    projectId: mongoIdSchema,
    workspaceId: mongoIdSchema,
  }),
  body: z
    .object({
      name: projectNameSchema.optional(),
      description: descriptionSchema,
      status: z.enum(ProjectStatusList).optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field required"
    ),
};

const deleteProjectSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
    projectId: mongoIdSchema,
  }),
};

module.exports = {
  createProjectSchema,
  getProjectSchema,
  getProjectsSchema,
  updateProjectSchema,
  deleteProjectSchema,
};
