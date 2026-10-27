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

const validateTaskDates = (data, ctx) => {
  const { startAt, endAt } = data;

  if (startAt && endAt && endAt <= startAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endAt"],
      message: "End date must be after start date",
    });
  }
};

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
    .strict()
    .superRefine(validateTaskDates),
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
    .superRefine(validateTaskDates)
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
      name: z.string().trim().min(1).optional(),
      project: mongoIdSchema.optional(),
      assignedTo: mongoIdSchema.optional(),
      status: z.enum(TaskStatusList).optional(),
      priority: z.enum(TaskPriorityList).optional(),
      tags: z
        .string()
        .trim()
        .regex(/^[^,]+(,[^,]+)*$/, "Tags must be comma-separated")
        .transform((s) => s.split(",").map((t) => t.trim()))
        .pipe(z.array(z.string().min(1, "Tags cannot be empty")))
        .optional(),

      createdFrom: z.coerce.date().optional(),
      createdTo: z.coerce.date().optional(),
      updatedFrom: z.coerce.date().optional(),
      updatedTo: z.coerce.date().optional(),

      sortBy: z
        .enum(["name", "createdAt", "updatedAt", "status", "priority"])
        .default("createdAt"),

      sortOrder: z.enum(["asc", "desc"]).default("desc"),

      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
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
