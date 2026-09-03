const { z } = require("zod");
const { mongoIdSchema } = require("./common.validator");
const {
  TaskStatusList,
  TaskPriorityList,
  TaskStatus,
  TaskPriority,
} = require("../../../config/enums/task");

const nameSchema = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name cannot exceed 50 characters")
  .regex(
    /^[a-zA-Z0-9\s_-]+$/,
    "Only letters, numbers, spaces, hyphens, and underscores are allowed.",
  );

const descriptionSchema = z
  .string()
  .trim()
  .max(500, "Description cannot exceed 500 characters")
  .optional();

const linksSchema = z
  .array(z.string().url("Each link must be a valid URL"))
  .optional();

const tagsSchema = z
  .array(z.string().trim().min(1, "Tags cannot be empty"))
  .optional();

const dateOrNullSchema = z
  .preprocess((value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    return new Date(value);
  }, z.date().nullable())
  .optional();

const createTaskSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
  body: z
    .object({
      name: nameSchema,
      description: descriptionSchema,
      project: mongoIdSchema,
      assignedTo: mongoIdSchema.optional().nullable(),
      links: linksSchema,
      tags: tagsSchema,
      startAt: dateOrNullSchema,
      endAt: dateOrNullSchema,
      status: z.enum(TaskStatusList).default(TaskStatus.BACKLOG),
      priority: z.enum(TaskPriorityList).default(TaskPriority.MEDIUM),
      completionProgress: z
        .number()
        .int()
        .min(0, "Must be ≥ 0")
        .max(100, "Must be ≤ 100")
        .default(0),
    })
    .strict(),
};

const updateTaskSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
    taskId: mongoIdSchema,
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      description: descriptionSchema,
      project: mongoIdSchema.optional(),
      assignedTo: mongoIdSchema.optional().nullable(),
      links: linksSchema,
      tags: tagsSchema,
      startAt: dateOrNullSchema,
      endAt: dateOrNullSchema,
      status: z.enum(TaskStatusList).optional(),
      priority: z.enum(TaskPriorityList).optional(),
      completionProgress: z
        .number()
        .int()
        .min(0, "Must be ≥ 0")
        .max(100, "Must be ≤ 100")
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

const getTaskSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
    taskId: mongoIdSchema,
  }),
};

const getTasksSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
  query: z
    .object({
      project: mongoIdSchema.optional(),
      assignedTo: mongoIdSchema.optional(),
      status: z.enum(TaskStatusList).optional(),
      priority: z.enum(TaskPriorityList).optional(),
      tags: z
        .string()
        .trim()
        .regex(/^[^,]+(,[^,]+)*$/, "Tags must be comma‑separated")
        .transform((s) => s.split(",").map((t) => t.trim()))
        .optional(),
      page: z
        .preprocess((val) => parseInt(String(val), 10), z.number().int().min(1))
        .default(1),
      limit: z
        .preprocess((val) => parseInt(String(val), 10), z.number().int().min(1))
        .default(10),
    })
    .strict(),
};

const deleteTaskSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
    taskId: mongoIdSchema,
  }),
};

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  getTasksSchema,
  deleteTaskSchema,
};
