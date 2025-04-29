const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getWorkspaceMembers,
  getWorkspaceMember,
  updateMemberOfWorkspace,
  addMemberToWorkspace,
  removeMemberFromWorkspace,
} = require("../controllers/member.controller");
const { authenticateToken } = require("../../../middleware/auth.middleware");
const validate = require("../../../middleware/validate.middleware");
const {
  updateMemberSchema,
  addMemberSchema,
  getWorkspaceMemberSchema,
  getWorkspaceMembersSchema,
} = require("../validators/member.validator");

router.get(
  "/",
  authenticateToken,
  validate(getWorkspaceMembersSchema),
  getWorkspaceMembers
);
router.put(
  "/",
  authenticateToken,
  validate(addMemberSchema),
  addMemberToWorkspace
);
router.get(
  "/:memberId",
  authenticateToken,
  validate(getWorkspaceMemberSchema),
  getWorkspaceMember
);
router.put(
  "/:memberId",
  authenticateToken,
  validate(updateMemberSchema),
  updateMemberOfWorkspace
);
router.delete("/:memberId", authenticateToken, removeMemberFromWorkspace);

module.exports = router;
