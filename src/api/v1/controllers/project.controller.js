const asyncHandler = require("../../../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const Project = require("../models/Project");
const APIResponse = require("../../../utils/APIResponse");
const { NotFoundError } = require("../../../errors");
const { Permissions } = require("../../../config/enums/permissions");
const {
  requirePermission,
  getAllowedFields,
  validateAllowedFields,
} = require("../../../utils/authorization");

const createProject = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const { name, description, status } = req.validated.body;
  const userId = req.user._id;

  const { role: requesterRole } = await requirePermission(
    workspaceId,
    userId,
    Permissions.PROJECT.CREATE,
  );
  const allowedFields = getAllowedFields(requesterRole, "PROJECT", "CREATE");
  validateAllowedFields(req.validated.body, allowedFields);

  const project = await Project.create({
    name,
    description,
    workspace: workspaceId,
    createdBy: userId,
    status,
  });

  APIResponse.success(req, res, {
    message: "Project created successfully",
    statusCode: StatusCodes.CREATED,
    data: project,
  });
});

const getProject = asyncHandler(async (req, res) => {
  const { projectId, workspaceId } = req.validated.params;
  const userId = req.user._id;

  await requirePermission(workspaceId, userId, Permissions.PROJECT.VIEW);

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId,
  })
    .populate("createdBy", "username email")
    .populate("workspace", "name description");

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  APIResponse.success(req, res, {
    message: "Project retrieved successfully",
    data: project,
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const { workspaceId, projectId } = req.validated.params;
  const updates = req.validated.body;
  const userId = req.user._id;

  const { role: requesterRole } = await requirePermission(
    workspaceId,
    userId,
    Permissions.PROJECT.UPDATE,
  );

  const allowedFields = getAllowedFields(requesterRole, "PROJECT", "UPDATE");
  validateAllowedFields(updates, allowedFields);

  const updatedProject = await Project.findOneAndUpdate(
    {
      _id: projectId,
      workspace: workspaceId,
    },
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProject) {
    throw new NotFoundError("Project not found.");
  }

  APIResponse.success(req, res, {
    message: "Project updated successfully",
    data: updatedProject,
  });
});

const deleteProject = asyncHandler(async (req, res) => {
  const { workspaceId, projectId } = req.validated.params;
  const userId = req.user._id;

  await requirePermission(workspaceId, userId, Permissions.PROJECT.DELETE);

  const deletedProject = await Project.findOneAndDelete({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!deletedProject) {
    throw new NotFoundError("Project not found.");
  }

  APIResponse.success(req, res, {
    message: "Project deleted successfully",
  });
});

const getProjects = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;
  const {
    status,
    name,
    createdBy,
    createdFrom,
    createdTo,
    updatedFrom,
    updatedTo,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.validated.query;

  await requirePermission(workspaceId, userId, Permissions.PROJECT.VIEW);

  const filter = {
    workspace: workspaceId,
  };

  if (status) {
    filter.status = status;
  }

  if (name) {
    filter.name = {
      $regex: name,
      $options: "i",
    };
  }

  if (createdBy) {
    filter.createdBy = createdBy;
  }

  if (createdFrom || createdTo) {
    filter.createdAt = {};

    if (createdFrom) {
      filter.createdAt.$gte = createdFrom;
    }

    if (createdTo) {
      filter.createdAt.$lte = createdTo;
    }
  }

  if (updatedFrom || updatedTo) {
    filter.updatedAt = {};

    if (updatedFrom) {
      filter.updatedAt.$gte = updatedFrom;
    }

    if (updatedTo) {
      filter.updatedAt.$lte = updatedTo;
    }
  }

  const skip = (page - 1) * limit;

  const [projects, totalItems] = await Promise.all([
    Project.find(filter)
      .populate("createdBy", "username email")
      .populate("workspace", "name description")
      .skip(skip)
      .limit(limit)
      .sort({
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      }),

    Project.countDocuments(filter),
  ]);

  APIResponse.pagination(req, res, {
    message: "Projects retrieved successfully",
    data: projects,
    page,
    pageSize: limit,
    totalItems,
  });
});

module.exports = {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjects,
};
