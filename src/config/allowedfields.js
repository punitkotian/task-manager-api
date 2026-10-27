const { Roles } = require("./enums/roles");

const AllowedFields = Object.freeze({
  [Roles.OWNER]: {
    WORKSPACE: {
      UPDATE: ["name", "description"],
    },

    PROJECT: {
      CREATE: ["name", "description", "status"],
      UPDATE: ["name", "description", "status"],
    },

    TASK: {
      CREATE: [
        "name",
        "description",
        "project",
        "assignedTo",
        "links",
        "tags",
        "startAt",
        "endAt",
        "status",
        "priority",
        "completionProgress",
      ],

      UPDATE_ANY: [
        "name",
        "description",
        "project",
        "assignedTo",
        "links",
        "tags",
        "startAt",
        "endAt",
        "status",
        "priority",
        "completionProgress",
      ],
    },

    MEMBER: {
      ADD: ["user", "role"],
      UPDATE_ROLE: ["role"],
    },
  },

  [Roles.ADMIN]: {
    WORKSPACE: {
      UPDATE: ["name", "description"],
    },

    PROJECT: {
      CREATE: ["name", "description", "status"],
      UPDATE: ["name", "description", "status"],
    },

    TASK: {
      CREATE: [
        "name",
        "description",
        "project",
        "assignedTo",
        "links",
        "tags",
        "startAt",
        "endAt",
        "status",
        "priority",
        "completionProgress",
      ],

      UPDATE_ANY: [
        "name",
        "description",
        "project",
        "assignedTo",
        "links",
        "tags",
        "startAt",
        "endAt",
        "status",
        "priority",
        "completionProgress",
      ],
    },

    MEMBER: {
      ADD: ["user", "role"],
      UPDATE_ROLE: ["role"],
    },
  },

  [Roles.MEMBER]: {
    WORKSPACE: {},

    PROJECT: {},

    TASK: {
      CREATE: [
        "name",
        "description",
        "project",
        "links",
        "tags",
        "startAt",
        "endAt",
      ],

      UPDATE_ASSIGNED: [
        "name",
        "description",
        "links",
        "tags",
        "startAt",
        "endAt",
        "status",
        "completionProgress",
      ],
    },

    MEMBER: {},
  },
});

module.exports = { AllowedFields };
