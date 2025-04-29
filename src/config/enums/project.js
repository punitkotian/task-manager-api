const ProjectStatus = Object.freeze({
  ACTIVE: "active",
  ON_HOLD: "on-hold",
  COMPLETED: "completed",
  ARCHIVED: "archived",
});

const ProjectStatusList = Object.freeze(Object.values(ProjectStatus));

module.exports = {
  ProjectStatus,
  ProjectStatusList,
};
