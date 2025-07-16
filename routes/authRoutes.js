const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deactivateAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../utils/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/me', protect, deactivateAccount);

module.exports = router;
