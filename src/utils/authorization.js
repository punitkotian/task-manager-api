const { NotFoundError, ForbiddenError, BadRequestError } = require("../errors");

const { RolePermissions } = require("../config/rolepermissions");
const Workspace = require("../api/v1/models/Workspace");
const Member = require("../api/v1/models/Member");
const { AllowedFields } = require("../config/allowedfields");

const hasPermission = (role, permission) => {
  return RolePermissions[role]?.includes(permission) ?? false;
};

const getEffectiveRole = (member) => {
  return member?.role ?? null;
};

const getAllowedFields = (role, resource, action) => {
  return AllowedFields[role]?.[resource]?.[action] ?? [];
};

const validateAllowedFields = (body, allowedFields) => {
  const extraFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field),
  );

  if (extraFields.length > 0) {
    throw new BadRequestError(`Fields not allowed: ${extraFields.join(", ")}`);
  }
};

const getWorkspaceAuthorization = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found.");
  }

  const member = await Member.findOne({
    workspace: workspaceId,
    user: userId,
  });

  const role = member?.role ?? null;

  return {
    workspace,
    member,
    role,
  };
};

const requirePermission = async (workspaceId, userId, permission) => {
  const authorization = await getWorkspaceAuthorization(workspaceId, userId);

  if (!hasPermission(authorization.role, permission)) {
    throw new ForbiddenError(
      "You do not have permission to perform this action.",
    );
  }

  return authorization;
};

module.exports = {
  hasPermission,
  getEffectiveRole,
  getAllowedFields,
  validateAllowedFields,
  getWorkspaceAuthorization,
  requirePermission,
};
