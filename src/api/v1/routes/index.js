const express = require("express");
const router = express.Router();

const userRouter = require("./user.route");
const taskRouter = require("./task.route");
const workspaceRouter = require("./workspace.route");
const memberRoutes = require("./member.route");
const projectRoutes = require("./project.route");
router.use("/users", userRouter);
router.use("/workspaces", workspaceRouter);
router.use("/workspaces/:workspaceId/members", memberRoutes);
router.use("/workspaces/:workspaceId/tasks", taskRouter);
router.use("/workspaces/:workspaceId/projects", projectRoutes);

module.exports = router;
