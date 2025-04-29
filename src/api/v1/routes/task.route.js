const express = require("express");
const {
  createTask,
  getTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const { authenticateToken } = require("../../../middleware/auth.middleware");
const validate = require("../../../middleware/validate.middleware");
const {
  createTaskSchema,
  updateTaskSchema,
  getTasksSchema,
  deleteTaskSchema,
  getTaskSchema,
} = require("../validators/task.validator");
const router = express.Router({ mergeParams: true });

router.post("/", authenticateToken, validate(createTaskSchema), createTask);
router.get("/:taskId", authenticateToken, validate(getTaskSchema), getTask);
router.get("/", authenticateToken, validate(getTasksSchema), getTasks);
router.put(
  "/:taskId",
  authenticateToken,
  validate(updateTaskSchema),
  updateTask
);
router.delete(
  "/:taskId",
  authenticateToken,
  validate(deleteTaskSchema),
  deleteTask
);

module.exports = router;
