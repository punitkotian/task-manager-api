const Task = require("../models/Task");
const Member = require("../models/Member");
const asyncHandler = require("../../../utils/asyncHandler");
const APIResponse = require("../../../utils/APIResponse");
const filterAllowedFields = require("../../../utils/filterAllowedFields");
const { NotFoundError, UnauthorizedError } = require("../../../errors");
const { StatusCodes } = require("http-status-codes");
const { Roles } = require("../../../config/enums/user");
const Project = require("../models/Project");

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
  const { assignedTo, project } = req.validated.body;
  const userId = req.user._id;

  const isAdmin = await Member.findOne({
    workspace: workspaceId,
    user: userId,
    role: Roles.ADMIN,
  });

  if (!isAdmin) {
    throw new UnauthorizedError(
      "Only admins can create tasks in this workspace."
    );
  }

  const isProject = await Project.exists({
    _id: project,
    workspace: workspaceId,
  });
  if (!isProject) {
    throw new NotFoundError("Project not found");
  }

  if (assignedTo) {
    const isMember = await Member.exists({
      _id: assignedTo,
      workspace: workspaceId,
    });

    if (!isMember) {
      throw new NotFoundError(
        "Assigned user must be a member of the workspace."
      );
    }
  }

  const task = await Task.create({
    ...req.validated.body,
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
  const isMember = await Member.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!isMember) {
    throw new UnauthorizedError(
      "You must be a member of this workspace to access tasks."
    );
  }

  const task = await Task.findById(taskId).populate(populateOptions).lean();

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
    project,
    assignedTo,
    status,
    priority,
    tags,
    page = 1,
    limit = 10,
  } = req.validated.query;
  const userId = req.user._id;

  const isMember = await Member.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!isMember) {
    throw new UnauthorizedError(
      "You are not authorized to view tasks in this workspace."
    );
  }

  const filter = { workspace: workspaceId };

  if (project) filter.project = project;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (tags) filter.tags = { $all: tags.split(",") };

  const skip = (page - 1) * limit;
  const [tasks, totalItems] = await Promise.all([
    Task.find(filter)
      .populate(populateOptions)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Task.countDocuments(filter),
  ]);

  if (!tasks.length) {
    throw new NotFoundError("No tasks found for the provided filters.");
  }

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
  

  const task = await Task.findById(taskId);
  if (!task) throw new NotFoundError("Task not found.");

  if (project) {
    const isProjectExists = await Project.exists({
      _id: project,
      workspace: workspaceId,
    });
    if (!isProjectExists) {
      throw new NotFoundError("Project not found");
    }
  }

  if (assignedTo) {
    const isMember = await Member.exists({
      workspace: workspaceId,
      _id: assignedTo,
    });

    if (!isMember) {
      throw new NotFoundError(
        "Assigned user must be a member of the workspace."
      );
    }
  }

  const member = await Member.findOne({ workspace: workspaceId, user: userId });
  if (!member) {
    throw new UnauthorizedError("Only workspace members can update tasks.");
  }

  let updates;
  const isAdmin = member.role === Roles.ADMIN;
  const isAssignee = task.assignedTo?.equals(userId);

  if (isAdmin) {
    updates = req.validated.body;
  } else if (isAssignee) {
    const allowed = ["status", "description"];
    updates = filterAllowedFields(req.validated.body, allowed);
  } else {
    throw new UnauthorizedError(
      "Only the assignee or an admin can update this task."
    );
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
    new: true,
    runValidators: true,
  }).populate(populateOptions);

  APIResponse.success(req, res, {
    message: "Task updated successfully.",
    data: updatedTask,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { workspaceId, taskId } = req.validated.params;
  const userId = req.user._id;

  const isAdmin = await Member.findOne({
    workspace: workspaceId,
    user: userId,
    role: Roles.ADMIN,
  });

  if (!isAdmin) {
    throw new UnauthorizedError("Only admins can delete tasks.");
  }

  const deletedTask = await Task.findByIdAndDelete(taskId);
  if (!deletedTask) throw new NotFoundError("Task not found.");

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
