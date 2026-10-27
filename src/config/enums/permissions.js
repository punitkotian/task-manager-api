const Permissions = Object.freeze({
  WORKSPACE: Object.freeze({
    VIEW: "workspace:view",
    UPDATE: "workspace:update",
    DELETE: "workspace:delete",
    CHANGE_OWNERSHIP: "workspace:change_ownership",
    MANAGE_INVITE_CODE: "workspace:manage_invite_code",
  }),

  PROJECT: Object.freeze({
    CREATE: "project:create",
    VIEW: "project:view",
    UPDATE: "project:update",
    DELETE: "project:delete",
  }),

  TASK: Object.freeze({
    CREATE: "task:create",
    VIEW: "task:view",
    UPDATE_ANY: "task:update_any",
    UPDATE_ASSIGNED: "task:update_assigned",
    DELETE: "task:delete",
    ASSIGN: "task:assign",
  }),

  MEMBER: Object.freeze({
    VIEW: "member:view",
    ADD: "member:add",
    REMOVE: "member:remove",
    UPDATE_ROLE: "member:update_role",
    LEAVE: "member:leave",
  }),
});

module.exports = { Permissions };
