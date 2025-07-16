const ApiError = require('../utils/apiError');

/**
 * Check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Not authorized, please login', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(`Role ${req.user.role} is not authorized to access this resource`, 403));
    }

    next();
  };
};

/**
 * Check if user is recruiter
 */
const isRecruiter = authorize('recruiter', 'admin');

/**
 * Check if user is job seeker
 */
const isJobSeeker = authorize('job_seeker', 'admin');

/**
 * Check if user is admin
 */
const isAdmin = authorize('admin');

/**
 * Check if user can access their own resource or is admin
 */
const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError('Not authorized, please login', 401));
  }

  const resourceUserId = req.params.userId || req.params.id;
  
  if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
    return next();
  }

  return next(new ApiError('Not authorized to access this resource', 403));
};

module.exports = {
  authorize,
  isRecruiter,
  isJobSeeker,
  isAdmin,
  isOwnerOrAdmin
};
