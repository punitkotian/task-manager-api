const express = require("express");
const {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjects,
} = require("../controllers/project.controller");
const { authenticateToken } = require("../../../middleware/auth.middleware");
const validate = require("../../../middleware/validate.middleware");
const {
  createProjectSchema,
  updateProjectSchema,
  getProjectsSchema,
  getProjectSchema,
  deleteProjectSchema,
} = require("../validators/project.validator");
const router = express.Router({ mergeParams: true });

router.post(
  "/",
  authenticateToken,
  validate(createProjectSchema),
  createProject
);
router.get("/", authenticateToken, validate(getProjectsSchema), getProjects);
router.get(
  "/:projectId",
  authenticateToken,
  validate(getProjectSchema),
  getProject
);
router.patch(
  "/:projectId",
  authenticateToken,
  validate(updateProjectSchema),
  updateProject
);
router.delete(
  "/:projectId",
  authenticateToken,
  validate(deleteProjectSchema),
  deleteProject
);

module.exports = router;
