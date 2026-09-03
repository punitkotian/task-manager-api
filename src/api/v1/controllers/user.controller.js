const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  accessTokenOptions,
  refreshTokenOptions,
  getCookieOptionsWithoutMaxAge,
} = require("../../../config/tokenOptions");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/tokenGenerator");
const asyncHandler = require("../../../utils/asyncHandler");
const { REFRESH_TOKEN_SECRET } = require("../../../config/key");
const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} = require("../../../errors");
const APIResponse = require("../../../utils/APIResponse");

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.validated.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    const conflicted = existingUser.email === email ? "Email" : "Username";
    throw new ConflictError(`${conflicted} is already in use.`);
  }

  const user = await User.create({ username, email, password });

  APIResponse.success(req, res, {
    message: "User registered successfully!",
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
    statusCode: StatusCodes.CREATED,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.validated.body;

  const user = await User.findOne({ username, isActive: true });

  if (!user) {
    throw new NotFoundError("Account not found or has been deactivated.");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Incorrect password.");
  }

  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens.push(refreshToken);
  await user.save();

  APIResponse.success(req, res, {
    message: "Login successful!",
    data: payload,
    statusCode: StatusCodes.OK,
    cookies: [
      { name: "accessToken", value: accessToken, options: accessTokenOptions },
      {
        name: "refreshToken",
        value: refreshToken,
        options: refreshTokenOptions,
      },
    ],
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken?.trim();
  const userId = req.user._id;

  if (!refreshToken) {
    throw new BadRequestError("Refresh token is missing.");
  }

  const user = await User.findOne({ _id: userId, isActive: true });
  if (!user) throw new NotFoundError("User not found or deactivated.");

  user.refreshTokens = user.refreshTokens.filter(
    (token) => token !== refreshToken,
  );
  await user.save();

  res.clearCookie(
    "accessToken",
    getCookieOptionsWithoutMaxAge(accessTokenOptions),
  );
  res.clearCookie(
    "refreshToken",
    getCookieOptionsWithoutMaxAge(refreshTokenOptions),
  );

  APIResponse.success(req, res, {
    message: "Logged out successfully.",
    statusCode: StatusCodes.OK,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  };

  APIResponse.success(req, res, {
    message: "User data fetched.",
    statusCode: StatusCodes.OK,
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.validated.body;
  const userId = req.user._id;

  if (!username && !email && !password) {
    throw new BadRequestError(
      "At least one field (username, email or password) must be provided.",
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (username) {
    const existingUser = await User.findOne({ username });
    if (existingUser && !existingUser._id.equals(userId)) {
      throw new ConflictError("Username is already taken.");
    }
    user.username = username;
  }

  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && !existingUser._id.equals(userId)) {
      throw new ConflictError("Email is already registered.");
    }

    user.email = email;
  }

  if (password) {
    user.password = password;
  }

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;
  delete updatedUser.refreshTokens;
  delete updatedUser.isActive;
  delete updatedUser.createdAt;
  delete updatedUser.updatedAt;
  delete updatedUser.__v;

  APIResponse.success(req, res, {
    message: "User profile updated.",
    data: updatedUser,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(userId, { isActive: false });

  if (!user) {
    throw new NotFoundError("User account not found.");
  }

  res.clearCookie(
    "accessToken",
    getCookieOptionsWithoutMaxAge(accessTokenOptions),
  );
  res.clearCookie(
    "refreshToken",
    getCookieOptionsWithoutMaxAge(refreshTokenOptions),
  );

  APIResponse.success(req, res, {
    message: "User account deactivated.",
    statusCode: StatusCodes.OK,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken?.trim();

  if (!oldRefreshToken) {
    throw new UnauthorizedError("Refresh token not provided.");
  }

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token.");
  }

  const user = await User.findOne({
    _id: decoded._id,
    isActive: true,
    refreshTokens: { $in: [oldRefreshToken] },
  });

  if (!user) {
    throw new ForbiddenError("Refresh token is invalid or revoked.");
  }

  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshTokens = user.refreshTokens.filter(
    (token) => token !== oldRefreshToken,
  );
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  APIResponse.success(req, res, {
    message: "Token refreshed successfully.",
    data: payload,
    cookies: [
      {
        name: "accessToken",
        value: newAccessToken,
        options: accessTokenOptions,
      },
      {
        name: "refreshToken",
        value: newRefreshToken,
        options: refreshTokenOptions,
      },
    ],
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateUser,
  deleteUser,
  refreshToken,
};
