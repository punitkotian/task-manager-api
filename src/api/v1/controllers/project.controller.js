const asyncHandler = require("../../../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const Project = require("../models/Project");
const Member = require("../models/Member");
const Workspace = require("../models/Workspace");
const APIResponse = require("../../../utils/APIResponse");
const { NotFoundError, UnauthorizedError } = require("../../../errors");
const { Roles } = require("../../../config/enums/user");


const checkAdmin = async (workspaceId, userId) => {
  return await Member.findOne({
    workspace: workspaceId,
    user: userId,
    role: Roles.ADMIN,
  });
};

const checkMember = async (workspaceId, userId) => {
  return await Member.findOne({ workspace: workspaceId, user: userId });
};

const createProject = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const { name, description, status } = req.validated.body;
  const userId = req.user._id;

  const workspaceExists = await Workspace.exists({ _id: workspaceId });
  if (!workspaceExists) throw new NotFoundError("Workspace not found");

  const isAdmin = await checkAdmin(workspaceId, userId);
  if (!isAdmin)
    throw new UnauthorizedError(
      "Only admins can create projects in this workspace"
    );

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

  const isMember = await checkMember(workspaceId, userId);
  if (!isMember)
    throw new UnauthorizedError("Access denied: not a workspace member");

  const project = await Project.findById(projectId)
    .populate("createdBy", "username email")
    .populate("workspace", "name description");

  if (!project) throw new NotFoundError("Project not found");

  APIResponse.success(req, res, {
    message: "Project retrieved successfully",
    data: project,
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const { workspaceId, projectId } = req.validated.params;
  const { name, description, status } = req.validated.body;
  const userId = req.user._id;

  const isAdmin = await checkAdmin(workspaceId, userId);
  if (!isAdmin) throw new UnauthorizedError("Only admins can update projects");

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    { name, description, status },
    { new: true, runValidators: true }
  );

  if (!updatedProject) throw new NotFoundError("Project not found");

  APIResponse.success(req, res, {
    message: "Project updated successfully",
    data: updatedProject,
  });
});

const deleteProject = asyncHandler(async (req, res) => {
  const { workspaceId, projectId } = req.validated.params;
  const userId = req.user._id;

  const isAdmin = await checkAdmin(workspaceId, userId);
  if (!isAdmin) throw new UnauthorizedError("Only admins can delete projects");

  const deletedProject = await Project.findByIdAndDelete(projectId);
  if (!deletedProject) throw new NotFoundError("Project not found");

  APIResponse.success(req, res, {
    message: "Project deleted successfully",
  });
});

const getProjects = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;
  const { tags, status, name, page = 1, limit = 10 } = req.validated.query;

  const isMember = await checkMember(workspaceId, userId);
  if (!isMember)
    throw new UnauthorizedError("Access denied: not a workspace member");

  const filter = { workspace: workspaceId };
  if (status) filter.status = status;
  if (Array.isArray(tags) && tags.length > 0) {
    filter.tags = { $all: tags };
  }
  if (name) filter.name = { $regex: name, $options: "i" };

  const skip = (page - 1) * limit;

  const [projects, totalItems] = await Promise.all([
    Project.find(filter)
      .populate("createdBy", "username email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Project.countDocuments(filter),
  ]);

  if (!projects.length) {
    throw new NotFoundError("No projects found in this workspace");
  }

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
