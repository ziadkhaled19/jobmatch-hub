const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError('Not authorized, no token provided', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new ApiError('Not authorized, user not found', 401));
      }

      if (!user.isActive) {
        return next(new ApiError('User account is deactivated', 401));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new ApiError('Not authorized, token failed', 401));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but continue without user
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  optionalAuth
};
