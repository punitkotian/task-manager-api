const express = require("express");
const {
  createWorkspace,
  updateWorkspace,
  getWorkspace,
  getWorkspaces,
  deleteWorkspace,
  joinWorkspace,
  regenerateInviteCode,
} = require("../controllers/workspace.controller");

const { authenticateToken } = require("../../../middleware/auth.middleware");
const validate = require("../../../middleware/validate.middleware");
const {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  joinWorkspaceSchema,
  getWorkspaceSchema,
  deleteWorkspaceSchema,
  regenerateInviteCodeSchema,
} = require("../validators/workspace.validator");
const router = express.Router();

router.post(
  "/",
  authenticateToken,
  validate(createWorkspaceSchema),
  createWorkspace
);
router.get("/", authenticateToken, getWorkspaces);
router.get(
  "/:workspaceId",
  authenticateToken,
  validate(getWorkspaceSchema),
  getWorkspace
);
router.put(
  "/:workspaceId",
  authenticateToken,
  validate(updateWorkspaceSchema),
  updateWorkspace
);
router.delete(
  "/:workspaceId",
  authenticateToken,
  validate(deleteWorkspaceSchema),
  deleteWorkspace
);

router.post(
  "/:workspaceId/invite-code",
  authenticateToken,
  validate(regenerateInviteCodeSchema),
  regenerateInviteCode
);
router.post(
  "/join/:inviteCode",
  authenticateToken,
  validate(joinWorkspaceSchema),
  joinWorkspace
);
module.exports = router;
