const { z } = require("zod");

const mongoIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

module.exports = { mongoIdSchema };
