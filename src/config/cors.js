const cors = require("cors");
const whitelist = require("./whitelist");
const { ForbiddenError } = require("../errors");

const configCors = () => {
  return cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new ForbiddenError("Origin not allowed by CORS"));
      }
    },
    credentials: true,
  });
};

module.exports = configCors;
