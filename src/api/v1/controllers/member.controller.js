const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../../../errors");
const Member = require("../models/Member");
const APIResponse = require("../../../utils/APIResponse");
const asyncHandler = require("../../../utils/asyncHandler");
const { Roles, AssignableMemberRoles } = require("../../../config/enums/roles");
const User = require("../models/User");
const {
  requirePermission,
  getAllowedFields,
  validateAllowedFields,
} = require("../../../utils/authorization");
const { Permissions } = require("../../../config/enums/permissions");
const { StatusCodes } = require("http-status-codes");

const getWorkspaceMember = asyncHandler(async (req, res) => {
  const { workspaceId, memberId } = req.validated.params;
  const userId = req.user._id;

  await requirePermission(workspaceId, userId, Permissions.MEMBER.VIEW);

  const member = await Member.findOne({
    _id: memberId,
    workspace: workspaceId,
  })
    .select("-__v")
    .populate("user", "_id username email")
    .lean();

  if (!member) {
    throw new NotFoundError("Member not found in this workspace.");
  }

  APIResponse.success(req, res, {
    message: "Member fetched successfully.",
    data: member,
  });
});

const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  await requirePermission(workspaceId, userId, Permissions.MEMBER.VIEW);

  const members = await Member.find({
    workspace: workspaceId,
  })
    .select("-__v")
    .populate("user", "_id username email")
    .lean();

  APIResponse.success(req, res, {
    message: "Workspace members fetched successfully.",
    data: members,
  });
});

const addMemberToWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const { user: userIdToAdd, role = Roles.MEMBER } = req.validated.body;

  const { role: requesterRole } = await requirePermission(
    workspaceId,
    userId,
    Permissions.MEMBER.ADD,
  );

  const allowedFields = getAllowedFields(requesterRole, "MEMBER", "ADD");
  validateAllowedFields(req.validated.body, allowedFields);

  if (!AssignableMemberRoles.includes(role)) {
    throw new BadRequestError("Invalid member role.");
  }

  if (role === Roles.ADMIN && requesterRole !== Roles.OWNER) {
    throw new ForbiddenError(
      "Only the workspace owner can assign the admin role.",
    );
  }

  const userToAddExists = await User.exists({
    _id: userIdToAdd,
    isActive: true,
  });

  if (!userToAddExists) {
    throw new NotFoundError("User to be added not found.");
  }

  const existingMember = await Member.findOne({
    workspace: workspaceId,
    user: userIdToAdd,
  });

  if (existingMember) {
    throw new BadRequestError("User is already a member of this workspace.");
  }

  const newMember = await Member.create({
    workspace: workspaceId,
    user: userIdToAdd,
    role,
  });

  APIResponse.success(req, res, {
    message: "Member added to workspace successfully.",
    statusCode: StatusCodes.CREATED,
    data: newMember,
  });
});

const updateMemberOfWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, memberId } = req.validated.params;
  const userId = req.user._id;
  const { role } = req.validated.body;

  const { role: requesterRole } = await requirePermission(
    workspaceId,
    userId,
    Permissions.MEMBER.UPDATE_ROLE,
  );

  const allowedFields = getAllowedFields(
    requesterRole,
    "MEMBER",
    "UPDATE_ROLE",
  );
  validateAllowedFields(req.validated.body, allowedFields);

  if (!AssignableMemberRoles.includes(role)) {
    throw new BadRequestError("Invalid member role.");
  }

  const member = await Member.findOne({
    _id: memberId,
    workspace: workspaceId,
  });

  if (!member) {
    throw new NotFoundError("Member not found in this workspace.");
  }

  // Never allow changing the owner through this endpoint.
  if (member.role === Roles.OWNER) {
    throw new ForbiddenError("The workspace owner's role cannot be changed.");
  }

  // Only owner can promote someone to admin.
  if (role === Roles.ADMIN && requesterRole !== Roles.OWNER) {
    throw new ForbiddenError(
      "Only the workspace owner can assign the admin role.",
    );
  }

  member.role = role;

  await member.save();

  APIResponse.success(req, res, {
    message: "Member role updated successfully.",
    data: member,
  });
});

const removeMemberFromWorkspace = asyncHandler(async (req, res) => {
  const { memberId, workspaceId } = req.validated.params;
  const userId = req.user._id;

  const { role: requesterRole } = await requirePermission(
    workspaceId,
    userId,
    Permissions.MEMBER.REMOVE,
  );

  const member = await Member.findOne({
    _id: memberId,
    workspace: workspaceId,
  });

  if (!member) {
    throw new NotFoundError("Member not found in this workspace.");
  }

  if (member.role === Roles.OWNER) {
    throw new ForbiddenError("The workspace owner cannot be removed.");
  }

  if (member.role === Roles.ADMIN && requesterRole !== Roles.OWNER) {
    throw new ForbiddenError("Only the workspace owner can remove an admin.");
  }

  await member.deleteOne();

  APIResponse.success(req, res, {
    message: "Member removed from workspace successfully.",
  });
});

module.exports = {
  getWorkspaceMember,
  getWorkspaceMembers,
  updateMemberOfWorkspace,
  addMemberToWorkspace,
  removeMemberFromWorkspace,
};
