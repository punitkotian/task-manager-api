const crypto = require("crypto");
const Workspace = require("../api/v1/models/Workspace");
const { InternalServerError } = require("../errors");

const MAX_RETRIES = 5;

const generateInviteCode = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from(
    { length },
    () => chars[crypto.randomInt(0, chars.length)],
  ).join("");
};

const generateUniqueInviteCode = async (currentInviteCode = null) => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const inviteCode = generateInviteCode();

    if (inviteCode === currentInviteCode) {
      continue;
    }

    const existingWorkspace = await Workspace.exists({ inviteCode });

    if (!existingWorkspace) {
      return inviteCode;
    }
  }

  throw new InternalServerError(
    "Unable to generate a unique invite code. Please try again.",
  );
};

module.exports = generateUniqueInviteCode;
