const TaskPriority = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

const TaskPriorityList = Object.freeze(Object.values(TaskPriority));

const TaskStatus = Object.freeze({
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  REVIEW: "review",
  COMPLETED: "completed",
  ARCHIVED: "archived",
});

const TaskStatusList = Object.freeze(Object.values(TaskStatus));

module.exports = {
  TaskPriority,
  TaskPriorityList,
  TaskStatus,
  TaskStatusList,
};
