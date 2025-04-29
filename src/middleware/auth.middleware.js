const { ACCESS_TOKEN_SECRET } = require("../config/key");
const { UnauthorizedError, ForbiddenError } = require("../errors");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token =
    req.cookies?.accessToken ||
    (authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1]);
  if (!token) {
    throw new UnauthorizedError("Unauthorized access");
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      throw new ForbiddenError("Forbidden: Invalid or expired token");
    }

    req.user = decoded;
    next();
  });
};

module.exports = {
  authenticateToken,
};
