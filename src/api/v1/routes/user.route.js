const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateUser,
  refreshToken,
} = require("../controllers/user.controller");

const express = require("express");
const { authenticateToken } = require("../../../middleware/auth.middleware");
const {
  registerSchema,
  loginSchema,
  updateUserSchema,
} = require("../validators/user.validator");
const validate = require("../../../middleware/validate.middleware");
const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", authenticateToken, logoutUser);
router.post("/refresh", refreshToken);
router
  .route("/me")
  .get(authenticateToken, getMe)
  .patch(authenticateToken, validate(updateUserSchema), updateUser)

module.exports = router;
