module.exports = {
  PORT: parseInt(process.env.PORT) || 8000,
  MONGO_URI: process.env.MONGO_URI,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};
