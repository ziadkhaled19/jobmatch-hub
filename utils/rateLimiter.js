const rateLimit = require("express-rate-limit");

// General rate limiter
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error:
        message || "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Auth rate limiter 
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  "Too many authentication attempts from this IP, please try again after 15 minutes."
);

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  "Too many API requests from this IP, please try again later."
);

// Job application rate limiter
const applicationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 applications per hour
  "Too many job applications from this IP, please try again after 1 hour."
);

module.exports = {
  authLimiter,
  apiLimiter,
  applicationLimiter,
};
