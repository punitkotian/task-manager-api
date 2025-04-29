const {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} = require("../../../errors");
const Member = require("../models/Member");
const APIResponse = require("../../../utils/APIResponse");
const asyncHandler = require("../../../utils/asyncHandler");
const { Roles } = require("../../../config/enums/user");
const Workspace = require("../models/Workspace");
const User = require("../models/User");

const getWorkspaceMember = asyncHandler(async (req, res) => {
  const { workspaceId, memberId } = req.validated.params;
  const userId = req.user._id;

  const isMember = await Member.findOne({
    workspace: workspaceId,
    user: userId,
  });
  if (!isMember) {
    throw new UnauthorizedError("You are not a member of this workspace");
  }

  const member = await Member.findById(memberId)
    .populate("user", "_id username email")
    .select("-__v")
    .lean();

  if (!member) {
    throw new NotFoundError("Member not found in this workspace");
  }

  APIResponse.success(req, res, {
    message: "Member fetched successfully",
    data: member,
  });
});

const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;

  const isMember = await Member.findOne({
    workspace: workspaceId,
    user: userId,
  });
  if (!isMember) {
    throw new UnauthorizedError(
      "You are not authorized to view members of this workspace"
    );
  }

  const members = await Member.find({ workspace: workspaceId })
    .populate("user", "_id username email")
    .lean();

  APIResponse.success(req, res, {
    message: "Workspace members fetched successfully",
    data: members,
  });
});

const addMemberToWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.validated.params;
  const userId = req.user._id;
  const { user: userIdToAdd, role } = req.validated.body;

  const workspace = await Workspace.exists({
    _id: workspaceId,
  });

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  const isAdmin = await Member.findOne({
    user: userId,
    workspace: workspaceId,
    role: Roles.ADMIN,
  });
  if (!isAdmin) {
    throw new UnauthorizedError("Only admins can add members to the workspace");
  }

  const userToAddExists = await User.exists({
    _id: userIdToAdd,
    isActive: true,
  });
  if (!userToAddExists) {
    throw new NotFoundError("User to be added not found");
  }

  const existingMember = await Member.findOne({
    workspace: workspaceId,
    user: userIdToAdd,
  });
  if (existingMember) {
    throw new BadRequestError("User is already a member of this workspace");
  }

  const newMember = await Member.create({
    workspace: workspaceId,
    user: userIdToAdd,
    role,
  });

  APIResponse.success(req, res, {
    message: "Member added to workspace successfully",
    data: newMember,
  });
});

const updateMemberOfWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, memberId } = req.validated.params;
  const userId = req.user._id;
  const { role } = req.validated.body;

  const isAdmin = await Member.findOne({
    workspace: workspaceId,
    user: userId,
    role: Roles.ADMIN,
  });
  if (!isAdmin) {
    throw new UnauthorizedError("Only admins can update member roles");
  }

  const updatedMember = await Member.findOneAndUpdate(
    { _id: memberId, workspace: workspaceId },
    { role },
    { new: true, runValidators: true }
  );

  if (!updatedMember) {
    throw new NotFoundError("Member not found in this workspace");
  }

  APIResponse.success(req, res, {
    message: "Member role updated successfully",
    data: updatedMember,
  });
});

const removeMemberFromWorkspace = asyncHandler(async (req, res) => {
  const { memberId, workspaceId } = req.validated.params;
  const userId = req.user._id;

  const isAdmin = await Member.findOne({
    workspace: workspaceId,
    user: userId,
    role: Roles.ADMIN,
  });
  if (!isAdmin) {
    throw new UnauthorizedError(
      "Only admins can remove members from the workspace"
    );
  }

  const deletedMember = await Member.findOneAndDelete({
    _id: memberId,
    workspace: workspaceId,
  });

  if (!deletedMember) {
    throw new NotFoundError("Member not found in this workspace");
  }

  APIResponse.success(req, res, {
    message: "Member removed from workspace successfully",
  });
});

module.exports = {
  getWorkspaceMember,
  getWorkspaceMembers,
  updateMemberOfWorkspace,
  addMemberToWorkspace,
  removeMemberFromWorkspace,
};
