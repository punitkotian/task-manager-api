const Task = require("../models/Task");
const Member = require("../models/Member");
const asyncHandler = require("../../../utils/asyncHandler");
const APIResponse = require("../../../utils/APIResponse");
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} = require("../../../errors");
const { StatusCodes } = require("http-status-codes");
const Project = require("../models/Project");
const {
  hasPermission,
  requirePermission,
  getAllowedFields,
  validateAllowedFields,
} = require("../../../utils/authorization");
const { Permissions } = require("../../../config/enums/permissions");

const populateOptions = [
  { path: "workspace", select: "name" },
  { path: "project", select: "name" },
  { path: "createdBy", select: "username email" },
  {
    path: "assignedTo",
    populate: {
      path: "user",
      select: "username email",
    },
  },
];

const createTask = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const { assignedTo, project, ...taskData } = req.validated.body;
  const userId = req.user._id;

  const { role: requesterRole } = await requirePermission(
    workspaceId,
    userId,
    Permissions.TASK.CREATE,
  );

  const allowedFields = getAllowedFields(requesterRole, "TASK", "CREATE");
  validateAllowedFields(req.validated.body, allowedFields);

  const isProject = await Project.exists({
    _id: project,
    workspace: workspaceId,
  });

  if (!isProject) {
    throw new NotFoundError("Project not found.");
  }

  if (assignedTo) {
    await requirePermission(workspaceId, userId, Permissions.TASK.ASSIGN);

    const isMember = await Member.exists({
      _id: assignedTo,
      workspace: workspaceId,
    });

    if (!isMember) {
      throw new NotFoundError("Assigned member not found in this workspace.");
    }
  }

  const task = await Task.create({
    ...taskData,
    project,
    assignedTo: assignedTo ?? null,
    workspace: workspaceId,
    createdBy: userId,
  });

  APIResponse.success(req, res, {
    message: "New task created successfully.",
    statusCode: StatusCodes.CREATED,
    data: task,
  });
});

const getTask = asyncHandler(async (req, res) => {
  const { workspaceId, taskId } = req.validated.params;
  const userId = req.user._id;

  await requirePermission(workspaceId, userId, Permissions.TASK.VIEW);

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId,
  })
    .populate(populateOptions)
    .lean();

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  APIResponse.success(req, res, {
    message: "Task retrieved successfully.",
    data: task,
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;

  const {
    name,
    project,
    assignedTo,
    status,
    priority,
    tags,
    createdFrom,
    createdTo,
    updatedFrom,
    updatedTo,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.validated.query;

  const userId = req.user._id;

  await requirePermission(workspaceId, userId, Permissions.TASK.VIEW);

  const filter = {
    workspace: workspaceId,
  };

  if (project) filter.project = project;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  if (tags?.length) {
    filter.tags = { $in: tags };
  }

  if (name) {
    filter.name = {
      $regex: name,
      $options: "i",
    };
  }

  if (createdFrom || createdTo) {
    filter.createdAt = {};

    if (createdFrom) filter.createdAt.$gte = createdFrom;
    if (createdTo) filter.createdAt.$lte = createdTo;
  }

  if (updatedFrom || updatedTo) {
    filter.updatedAt = {};

    if (updatedFrom) filter.updatedAt.$gte = updatedFrom;
    if (updatedTo) filter.updatedAt.$lte = updatedTo;
  }

  const skip = (page - 1) * limit;

  const [tasks, totalItems] = await Promise.all([
    Task.find(filter)
      .populate(populateOptions)
      .sort({
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      })
      .skip(skip)
      .limit(limit),

    Task.countDocuments(filter),
  ]);

  APIResponse.pagination(req, res, {
    message: "Tasks retrieved successfully.",
    data: tasks,
    page,
    pageSize: limit,
    totalItems,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const { workspaceId, taskId } = req.validated.params;
  const { project, assignedTo } = req.validated.body;
  const userId = req.user._id;

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const updatedStartAt =
    req.validated.body.startAt !== undefined
      ? req.validated.body.startAt
      : task.startAt;

  const updatedEndAt =
    req.validated.body.endAt !== undefined
      ? req.validated.body.endAt
      : task.endAt;

  if (updatedStartAt && updatedEndAt && updatedEndAt <= updatedStartAt) {
    throw new BadRequestError("End date must be after start date.");
  }

  const member = await Member.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!member) {
    throw new ForbiddenError("You are not a member of this workspace.");
  }

  const canUpdateAny = hasPermission(member.role, Permissions.TASK.UPDATE_ANY);

  const canUpdateAssigned =
    hasPermission(member.role, Permissions.TASK.UPDATE_ASSIGNED) &&
    task.assignedTo?.equals(member._id);

  if (!canUpdateAny && !canUpdateAssigned) {
    throw new ForbiddenError("You do not have permission to update this task.");
  }

  const allowedFields = getAllowedFields(
    member.role,
    "TASK",
    canUpdateAny ? "UPDATE_ANY" : "UPDATE_ASSIGNED",
  );

  validateAllowedFields(req.validated.body, allowedFields);

  if (project !== undefined) {
    const projectExists = await Project.exists({
      _id: project,
      workspace: workspaceId,
    });

    if (!projectExists) {
      throw new NotFoundError("Project not found.");
    }
  }

  if (assignedTo !== undefined) {
    await requirePermission(workspaceId, userId, Permissions.TASK.ASSIGN);

    if (assignedTo !== null) {
      const assignedMemberExists = await Member.exists({
        _id: assignedTo,
        workspace: workspaceId,
      });

      if (!assignedMemberExists) {
        throw new NotFoundError("Assigned member not found in this workspace.");
      }
    }
  }

  const updatedTask = await Task.findOneAndUpdate(
    {
      _id: taskId,
      workspace: workspaceId,
    },
    {
      $set: req.validated.body,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(populateOptions);

  APIResponse.success(req, res, {
    message: "Task updated successfully.",
    data: updatedTask,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { workspaceId, taskId } = req.validated.params;
  const userId = req.user._id;

  await requirePermission(workspaceId, userId, Permissions.TASK.DELETE);

  const deletedTask = await Task.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!deletedTask) {
    throw new NotFoundError("Task not found.");
  }

  APIResponse.success(req, res, {
    message: "Task deleted successfully.",
  });
});

module.exports = {
  createTask,
  getTask,
  getTasks,
  updateTask,
  deleteTask,
};
