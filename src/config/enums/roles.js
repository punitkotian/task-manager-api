const Roles = Object.freeze({
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
});

const RolesList = Object.freeze(Object.values(Roles));

const AssignableMemberRoles = Object.freeze([Roles.ADMIN, Roles.MEMBER]);

module.exports = {
  Roles,
  RolesList,
  AssignableMemberRoles,
};
