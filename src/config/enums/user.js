const Roles = Object.freeze({
  ADMIN: "admin",
  MEMBER: "member",
});

const RolesList = Object.freeze(Object.values(Roles));

module.exports = {
  Roles,
  RolesList,
};
