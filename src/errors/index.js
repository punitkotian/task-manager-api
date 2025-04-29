const { StatusCodes } = require("http-status-codes");

class APIError extends Error {
  constructor(
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    message = "Internal Server Error",
    errorCode = "SERVER_ERROR"
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class BadRequestError extends APIError {
  constructor(message = "Invalid request parameters") {
    super(StatusCodes.BAD_REQUEST, message, "BAD_REQUEST");
  }
}

class UnauthorizedError extends APIError {
  constructor(message = "Authentication required") {
    super(StatusCodes.UNAUTHORIZED, message, "UNAUTHORIZED");
  }
}

class ForbiddenError extends APIError {
  constructor(message = "Insufficient permissions") {
    super(StatusCodes.FORBIDDEN, message, "FORBIDDEN");
  }
}

class NotFoundError extends APIError {
  constructor(message = "Resource not found") {
    super(StatusCodes.NOT_FOUND, message, "NOT_FOUND");
  }
}

class ConflictError extends APIError {
  constructor(message = "Resource conflict") {
    super(StatusCodes.CONFLICT, message, "CONFLICT");
  }
}

class ValidationError extends APIError {
  constructor(message = "Validation failed", errors = []) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message, "VALIDATION_ERROR");
    this.errors = errors; 
  }
}

class InternalServerError extends APIError {
  constructor(message = "Internal server error") {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, "SERVER_ERROR");
  }
}

module.exports = {
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
};
