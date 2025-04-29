const { NODE_ENV } = require("../config/key");
const { StatusCodes } = require("http-status-codes");

class APIResponse {
  static success(
    req,
    res,
    {
      message = "Success",
      data = null,
      statusCode = StatusCodes.OK,
      metadata = {},
      cookies = [],
    } = {}
  ) {
    const response = {
      success: true,
      message,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId,
        ...metadata,
      },
    };

    cookies.forEach((cookie) => {
      res.cookie(cookie.name, cookie.value, cookie.options || {});
    });

    return res.status(statusCode).json(response);
  }

  static error(req, res, { error = {}, metadata = {} }) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const response = {
      success: false,
      error: {
        code: error.errorCode || "INTERNAL_SERVER_ERROR",
        message: error.message || "Internal Server Error",
        details: error.details || null,
        ...(error.errors && { errors: error.errors }),
        ...(NODE_ENV === "development" && {
          stack: error.stack,
        }),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId,
        ...metadata,
      },
    };

    return res.status(statusCode).json(response);
  }

  static pagination(
    req,
    res,
    {
      message = "Paginated results",
      data = null,
      statusCode = StatusCodes.OK,
      metadata = {},
      page = 1,
      pageSize = 10,
      totalItems = 0,
    } = {}
  ) {
    const currentPage = parseInt(page) || 1;
    const size = parseInt(pageSize) || 1;
    const total = parseInt(totalItems);
    const totalPages = Math.ceil(total / Math.max(pageSize, 1));
    const paginationMetadata = {
      pagination: {
        page: currentPage,
        pageSize: size,
        totalItems: total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };

    return APIResponse.success(req, res, {
      message,
      data,
      statusCode,
      metadata: {
        ...paginationMetadata,
        ...metadata,
      },
    });
  }
}

module.exports = APIResponse;
