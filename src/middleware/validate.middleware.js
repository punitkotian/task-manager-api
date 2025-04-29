const { ValidationError } = require("../errors");

const validate = (schemas) => {
  return (req, res, next) => {
    const validatedData = {};
    const errors = [];

    for (const key of ["params", "body", "query", "headers"]) {
      const schema = schemas[key];
      if (schema) {
        const result = schema.safeParse(req[key]);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map((e) => ({
              field: e.path.length ? `${key}.${e.path.join(".")}` : key,
              message: e.message,
            }))
          );
        } else {
          validatedData[key] = result.data;
        }
      }
    }

    if (errors.length) {
      return next(new ValidationError("Validation failed", errors));
    }

    req.validated = validatedData;
    next();
  };
};

module.exports = validate;
