const { StatusCodes } = require("http-status-codes");
const Workspace = require("../models/Workspace");
const Member = require("../models/Member");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const APIResponse = require("../../../utils/APIResponse");
const asyncHandler = require("../../../utils/asyncHandler");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../../../errors");
const { Roles } = require("../../../config/enums/user");


const generateInviteCode = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.validated.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  const workspace = await Workspace.create({
    name,
    description,
    owner: userId,
    inviteCode: generateInviteCode(),
  });

  await Member.create({
    user: userId,
    workspace: workspace._id,
    role: Roles.ADMIN,
  });

  APIResponse.success(req, res, {
    message: "Workspace created successfully.",
    statusCode: StatusCodes.CREATED,
    data: workspace,
  });
});

const getWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const membership = await Member.findOne({
    workspace: workspaceId,
    user: userId,
  });
  if (!membership) {
    throw new UnauthorizedError(
      "Access denied. You are not a member of this workspace."
    );
  }

  
  const workspace = await Workspace.findById(workspaceId).populate(
    "owner",
    "name email"
  );
  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  APIResponse.success(req, res, {
    message: "Workspace fetched successfully.",
    data: workspace,
  });
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { name, description, regenerateInviteCode } = req.validated.body;
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;
  const updateFields = { name, description };

  if (regenerateInviteCode) {
    updateFields.inviteCode = generateInviteCode();
  }

  const isAdmin = await Member.findOne({
    user: userId,
    workspace: workspaceId,
    role: Roles.ADMIN,
  });

  if (!isAdmin) {
    throw new UnauthorizedError("Only admins can update the workspace.");
  }

  const updatedWorkspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!updatedWorkspace) {
    throw new NotFoundError("Workspace not found.");
  }

  APIResponse.success(req, res, {
    message: "Workspace updated successfully.",
    data: updatedWorkspace,
  });
});

const regenerateInviteCode = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const isAdmin = await Member.findOne({
    user: userId,
    workspace: workspaceId,
    role: Roles.ADMIN,
  });
  if (!isAdmin) {
    throw new UnauthorizedError("Only admins can regenerate the invite code.");
  }

  const updateWorkspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    {
      inviteCode: generateInviteCode(),
    },
    { new: true, runValidators: true }
  );

  if (!updateWorkspace) {
    throw new NotFoundError("Workspace not found");
  }

  APIResponse.success(req, res, {
    message: "Invite code regenerated",
    data: {
      inviteCode: updateWorkspace.inviteCode,
    },
  });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const isAdmin = await Member.findOne({
    user: userId,
    workspace: workspaceId,
    role: Roles.ADMIN,
  });

  if (!isAdmin) {
    throw new UnauthorizedError("Only admins can delete a workspace.");
  }

  const [deletedWorkspace] = await Promise.all([
    Workspace.findByIdAndDelete(workspaceId),
    Member.deleteMany({ workspace: workspaceId }),
    Project.deleteMany({ workspace: workspaceId }),
    Task.deleteMany({ workspace: workspaceId }),
  ]);

  if (!deletedWorkspace) {
    throw new NotFoundError("Workspace not found.");
  }

  APIResponse.success(req, res, {
    message: "Workspace and associated data deleted successfully.",
  });
});


const getWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [ownedWorkspaces, memberships] = await Promise.all([
    Workspace.find({ owner: userId }),
    Member.find({ user: userId }).populate("workspace"),
  ]);

  const workspaces = [
    ...ownedWorkspaces,
    ...memberships.map((m) => m.workspace),
  ].filter(
    (w, i, self) =>
      self.findIndex((x) => x._id.toString() === w._id.toString()) === i
  );

  APIResponse.success(req, res, {
    message: "Workspaces retrieved successfully.",
    data: workspaces,
  });
});

const joinWorkspace = asyncHandler(async (req, res) => {
  const { inviteCode } = req.validated.params;
  const userId = req.user._id;

  const workspace = await Workspace.findOne({ inviteCode });
  if (!workspace) {
    throw new NotFoundError("Invalid invite code.");
  }

  const alreadyMember = await Member.findOne({
    user: userId,
    workspace: workspace._id,
  });

  if (alreadyMember) {
    throw new BadRequestError("You are already a member of this workspace.");
  }

  const newMember = await Member.create({
    user: userId,
    workspace: workspace._id,
    role: Roles.MEMBER,
  });

  APIResponse.success(req, res, {
    message: "Successfully joined the workspace.",
    data: newMember,
  });
});

module.exports = {
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaces,
  joinWorkspace,
  regenerateInviteCode,
};
