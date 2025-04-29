const { NODE_ENV } = require("../config/key");
const { StatusCodes } = require("http-status-codes");
const { APIError } = require("../errors");
const APIResponse = require("../utils/APIResponse");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof APIError)) {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      error = new APIError(
        StatusCodes.BAD_REQUEST,
        "Invalid JSON payload",
        "BAD_REQUEST"
      );
    } else {
      if (err instanceof Error) {
        error = new APIError(
          err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
          err.message,
          err.errorCode || "INTERNAL_SERVER_ERROR"
        );
      } else {
        const message =
          typeof err === "object" ? JSON.stringify(err) : String(err);
        error = new APIError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          message,
          "INTERNAL_SERVER_ERROR"
        );
      }
      error.isOperational = false;
    }
  }

  if (res.headersSent) {
    return next(error);
  }

  if (NODE_ENV !== "development" && !error.isOperational) {
    error.message = "Internal Server Error";
    error.details = null;
  }

  if (NODE_ENV === "development") {
    console.error("Error Details:", {
      message: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      path: req.originalUrl,
      method: req.method,
      correlationId: req.correlationId,
    });
  }

  return APIResponse.error(req, res, {
    error,
    metadata: {},
  });
};

module.exports = errorHandler;
