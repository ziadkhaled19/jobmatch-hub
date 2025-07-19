const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deactivateAccount,
  forgotPassword,
  resetPassword,
  activateMe,
  getUser,
  searchUsers
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const { authLimiter } = require("../utils/rateLimiter");

const router = express.Router();

// Public routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfile);
router.put("/password", protect, changePassword);
router.delete("/deleteMe", protect, deactivateAccount);
router.patch("/activateMe", protect, activateMe);

// admin routes
router.get("/search-users", protect, isAdmin, searchUsers);
router.get("/:userId", protect, isAdmin, getUser);


// Password reset routes
router.patch("/forgot-password", forgotPassword);
router.put("/resetPassword/:resetToken", resetPassword);

module.exports = router;
