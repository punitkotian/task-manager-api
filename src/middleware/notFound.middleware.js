const { NotFoundError } = require("../errors");

const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Endpoint '${req.originalUrl}' not found`));
};

module.exports = notFoundHandler;
