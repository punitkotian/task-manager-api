const { z } = require("zod");
const { mongoIdSchema } = require("./common.validator");
const { RolesList, Roles } = require("../../../config/enums/roles");

const getWorkspaceMemberSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
    memberId: mongoIdSchema,
  }),
};

const getWorkspaceMembersSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
};

const addMemberSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
  body: z.object({
    user: mongoIdSchema,
    role: z.enum(RolesList).optional().default(Roles.MEMBER),
  }),
};

const updateMemberSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
    memberId: mongoIdSchema,
  }),
  body: z.object({
    role: z.enum(RolesList),
  }),
};

const removeWorkspaceMemberSchema = {
  params: z.object({
    workspaceId: mongoIdSchema,
    memberId: mongoIdSchema,
  }),
};

module.exports = {
  getWorkspaceMemberSchema,
  getWorkspaceMembersSchema,
  addMemberSchema,
  updateMemberSchema,
  removeWorkspaceMemberSchema,
};
