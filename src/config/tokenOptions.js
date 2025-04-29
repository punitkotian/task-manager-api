const { NODE_ENV } = require("./key");

const isProd = NODE_ENV === "production";

const accessTokenOptions = {
  httpOnly: true,
  secure: isProd, 
  sameSite: isProd ? "None" : "Lax",
  maxAge: 15 * 60 * 1000, 
};

const refreshTokenOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getCookieOptionsWithoutMaxAge = (options) => {
  const { maxAge, ...rest } = options;
  return rest;
};

module.exports = {
  accessTokenOptions,
  refreshTokenOptions,
  getCookieOptionsWithoutMaxAge,
};
