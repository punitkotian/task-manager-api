const { StatusCodes } = require("http-status-codes");

const Workspace = require("../models/Workspace");
const Member = require("../models/Member");
const Project = require("../models/Project");
const Task = require("../models/Task");

const APIResponse = require("../../../utils/APIResponse");
const asyncHandler = require("../../../utils/asyncHandler");

const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../../../errors");

const { Roles } = require("../../../config/enums/roles");
const { Permissions } = require("../../../config/enums/permissions");

const {
  requirePermission,
  getAllowedFields,
  validateAllowedFields,
} = require("../../../utils/authorization");
const generateUniqueInviteCode = require("../../../utils/generateUniqueInviteCode");


const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.validated.body;
  const userId = req.user._id;

  const inviteCode = await generateUniqueInviteCode();

  const workspace = await Workspace.create({
    name,
    description,
    owner: userId,
    inviteCode,
  });

  await Member.create({
    workspace: workspace._id,
    user: userId,
    role: Roles.OWNER,
  });

  return APIResponse.success(req, res, {
    message: "Workspace created successfully.",
    statusCode: StatusCodes.CREATED,
    data: workspace,
  });
});

const getWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const { workspace, role } = await requirePermission(
    workspaceId,
    userId,
    Permissions.WORKSPACE.VIEW,
  );

  await workspace.populate("owner", "username email");

  const data = {
    ...workspace.toObject(),
    role,
  };

  return APIResponse.success(req, res, {
    message: "Workspace fetched successfully.",
    data,
  });
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.validated.body;
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const { workspace, role } = await requirePermission(
    workspaceId,
    userId,
    Permissions.WORKSPACE.UPDATE,
  );

  const allowedFields = getAllowedFields(role, "WORKSPACE", "UPDATE");
  validateAllowedFields(req.validated.body, allowedFields);

  if (name !== undefined) {
    workspace.name = name;
  }

  if (description !== undefined) {
    workspace.description = description;
  }

  await workspace.save();

  APIResponse.success(req, res, {
    message: "Workspace updated successfully.",
    data: workspace,
  });
});

const regenerateInviteCode = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const { workspace } = await requirePermission(
    workspaceId,
    userId,
    Permissions.WORKSPACE.MANAGE_INVITE_CODE,
  );

  workspace.inviteCode = await generateUniqueInviteCode(workspace._id);

  await workspace.save();

  return APIResponse.success(req, res, {
    message: "Invite code regenerated successfully.",
    data: {
      inviteCode: workspace.inviteCode,
    },
  });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  await requirePermission(workspaceId, userId, Permissions.WORKSPACE.DELETE);

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

  const memberships = await Member.find({ user: userId })
    .select("workspace role")
    .populate({
      path: "workspace",
      select: "name description owner createdAt updatedAt",
      populate: {
        path: "owner",
        select: "username email",
      },
    });

  const workspaces = memberships
    .filter((membership) => membership.workspace)
    .map((membership) => ({
      ...membership.workspace.toObject(),
      role: membership.role,
    }));

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

  if (workspace.owner.equals(userId)) {
    throw new BadRequestError("You are already the owner of this workspace.");
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

const transferWorkspaceOwnership = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const { userId: newOwnerId } = req.validated.body;
  const userId = req.user._id;

  const { workspace, role: requesterRole } = await requirePermission(
    workspaceId,
    userId,
    Permissions.WORKSPACE.CHANGE_OWNERSHIP,
  );

  if (requesterRole !== Roles.OWNER) {
    throw new ForbiddenError(
      "Only the workspace owner can transfer ownership.",
    );
  }

  const newOwner = await Member.findOne({
    workspace: workspaceId,
    user: newOwnerId,
  });

  if (!newOwner) {
    throw new BadRequestError(
      "The new owner must be a member of this workspace.",
    );
  }

  if (newOwner.role === Roles.OWNER) {
    throw new BadRequestError("This user is already the workspace owner.");
  }

  const currentOwner = await Member.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!currentOwner) {
    throw new NotFoundError("Current owner membership not found.");
  }

  currentOwner.role = Roles.ADMIN;
  newOwner.role = Roles.OWNER;

  await Promise.all([currentOwner.save(), newOwner.save()]);

  workspace.owner = newOwnerId;
  await workspace.save();

  APIResponse.success(req, res, {
    message: "Workspace ownership transferred successfully.",
    data: workspace,
  });
});

const leaveWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const { member } = await requirePermission(
    workspaceId,
    userId,
    Permissions.MEMBER.LEAVE,
  );

  if (member.role === Roles.OWNER) {
    throw new ForbiddenError(
      "The workspace owner cannot leave the workspace. Transfer ownership first.",
    );
  }

  await member.deleteOne();

  APIResponse.success(req, res, {
    message: "You have left the workspace successfully.",
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
  transferWorkspaceOwnership,
  leaveWorkspace,
};
