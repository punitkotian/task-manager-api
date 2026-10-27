const { Roles } = require("./enums/roles");
const { Permissions } = require("./enums/permissions");

const RolePermissions = Object.freeze({
  [Roles.OWNER]: [
    ...Object.values(Permissions.WORKSPACE),
    ...Object.values(Permissions.PROJECT),
    ...Object.values(Permissions.TASK),
    ...Object.values(Permissions.MEMBER),
  ],

  [Roles.ADMIN]: [
    Permissions.WORKSPACE.VIEW,
    Permissions.WORKSPACE.UPDATE,
    Permissions.WORKSPACE.MANAGE_INVITE_CODE,

    Permissions.PROJECT.CREATE,
    Permissions.PROJECT.VIEW,
    Permissions.PROJECT.UPDATE,
    Permissions.PROJECT.DELETE,

    Permissions.TASK.CREATE,
    Permissions.TASK.VIEW,
    Permissions.TASK.UPDATE_ANY,
    Permissions.TASK.DELETE,
    Permissions.TASK.ASSIGN,

    Permissions.MEMBER.VIEW,
    Permissions.MEMBER.ADD,
    Permissions.MEMBER.REMOVE,
    Permissions.MEMBER.UPDATE_ROLE,
    Permissions.MEMBER.LEAVE,
  ],

  [Roles.MEMBER]: [
    Permissions.WORKSPACE.VIEW,

    Permissions.PROJECT.VIEW,

    Permissions.TASK.CREATE,
    Permissions.TASK.VIEW,
    Permissions.TASK.UPDATE_ASSIGNED,

    Permissions.MEMBER.VIEW,
    Permissions.MEMBER.LEAVE,
  ],
});

module.exports = { RolePermissions };
